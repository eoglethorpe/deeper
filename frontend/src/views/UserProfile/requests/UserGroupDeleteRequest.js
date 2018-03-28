import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserGroup,
    createParamsForUserGroupsDelete,
} from '../../../rest';
import notify from '../../../notify';

export default class UserGroupDeleteRequest {
    constructor(props) {
        this.props = props;
    }

    create = ({ userGroupId, userId }) => {
        const urlForUserGroup = createUrlForUserGroup(userGroupId);

        const userGroupDeletRequest = new FgRestBuilder()
            .url(urlForUserGroup)
            .params(() => createParamsForUserGroupsDelete())
            .success(() => {
                try {
                    this.props.unSetUserGroup({
                        userGroupId,
                        userId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userGroupDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userGroupDeleteSuccess'),
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
                    title: this.props.notificationStrings('userGroupDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userGroupDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupDeleteFatal'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userGroupDeletRequest;
    }
}
