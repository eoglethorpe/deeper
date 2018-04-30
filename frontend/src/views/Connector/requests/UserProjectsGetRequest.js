import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForProjectsOfUser,
    createParamsForProjects,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

export default class UserProjectsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = userId => (response) => {
        try {
            schema.validate(response, 'projectsGetResponse');
            this.props.setUserProjects({
                userId,
                projects: response.results,
                extra: response.extra,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: this.props.notificationStrings('projectsTitle'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('projectsGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = (response) => {
        console.warn('fatal:', response);
    }

    create = (userId) => {
        const projectsRequest = new FgRestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(() => createParamsForProjects())
            .preLoad(() => { this.props.setState({ projectDataLoading: true }); })
            .postLoad(() => { this.props.setState({ projectDataLoading: false }); })
            .success(() => this.success(userId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return projectsRequest;
    }
}
