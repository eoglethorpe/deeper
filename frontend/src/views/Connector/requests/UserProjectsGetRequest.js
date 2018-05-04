import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';

import {
    createUrlForProjectsOfUser,
    createParamsForProjects,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';
import _ts from '../../../ts';

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

    failure = (response) => {
        notify.send({
            title: _ts('notification', 'projectsTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('notification', 'projectsTitle'),
            type: notify.type.ERROR,
            message: _ts('notification', 'projectsGetFailure'),
            duration: notify.duration.MEDIUM,
        });
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
