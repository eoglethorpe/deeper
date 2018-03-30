import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForProject,
    createParamsForProjectDelete,
} from '../../../rest';
import notify from '../../../notify';

export default class ProjectDeleteRequest {
    constructor(props) {
        this.props = props;
    }

    create = ({ projectId, userId }) => {
        const urlForProject = createUrlForProject(projectId);

        const projectDeleteRequest = new FgRestBuilder()
            .url(urlForProject)
            .params(() => createParamsForProjectDelete())
            .success(() => {
                try {
                    this.props.unSetProject({
                        userId,
                        projectId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userProjectDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userProjectDeleteSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .preLoad(() => {
                this.props.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.props.setState({ deletePending: false });
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('userProjectDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userProjectDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userProjectDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userProjectDeleteFatal'),
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return projectDeleteRequest;
    }
}
