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

    notifySuccess = () => {
        notify.send({
            title: this.props.notificationStrings('userProjectDelete'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('userProjectDeleteSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    notifyFailure = () => {
        notify.send({
            title: this.props.notificationStrings('userProjectDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('userProjectDeleteFailure'),
            duration: notify.duration.MEDIUM,
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
            .success(() => {
                try {
                    this.props.unSetProject({
                        projectId: id,
                        userId,
                    });
                    this.notifySuccess();
                    this.props.setState({ showDeleteProjectModal: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('Failure:', response);
                this.notifyFailure();
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.notifyFailure();
            })
            .build();
        return projectDeleteRequest;
    }
}
