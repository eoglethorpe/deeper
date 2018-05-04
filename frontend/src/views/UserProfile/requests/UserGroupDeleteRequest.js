import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserGroup,
    createParamsForUserGroupsDelete,
} from '../../../rest';
import notify from '../../../notify';
import _ts from '../../../ts';

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
                        title: _ts('notification', 'userGroupDelete'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'userGroupDeleteSuccess'),
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
                    title: _ts('notification', 'userGroupDelete'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'userGroupDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('notification', 'userGroupDelete'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'userGroupDeleteFatal'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return userGroupDeletRequest;
    }
}
