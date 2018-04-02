import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForProject,
    createParamsForProjectDelete,
} from '../../../rest';
import notify from '../../../notify';

/*
 * props: setState, unSetProject, notificationStrings
*/

export default class ProjectDeleteRequest {
    constructor(props) {
        this.props = props;
    }

    success = (id, userId) => () => {
        try {
            this.props.unSetProject({
                projectId: id,
                userId,
            });
            notify.send({
                title: this.props.notificationStrings('userProjectDelete'),
                type: notify.type.SUCCESS,
                message: this.props.notificationStrings('userProjectDeleteSuccess'),
                duration: notify.duration.MEDIUM,
            });
            this.props.setState({ showDeleteProjectModal: false });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        console.warn('FAILURE:', response);
        notify.send({
            title: this.props.notificationStrings('userProjectDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('userProjectDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = (response) => {
        console.warn('FATAL:', response);
        notify.send({
            title: this.props.notificationStrings('userProjectDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('userProjectDeleteFailure'),
            duration: notify.duration.SLOW,
        });
    }

    create = ({ id, userId }) => {
        const projectDeleteRequest = new FgRestBuilder()
            .url(createUrlForProject(id))
            .params(createParamsForProjectDelete)
            .preLoad(() => {
                this.props.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.props.setState({ deletePending: false });
            })
            .success(this.success(id, userId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return projectDeleteRequest;
    }
}
