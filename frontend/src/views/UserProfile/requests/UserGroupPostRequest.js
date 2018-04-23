import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    urlForUserGroups,
    createParamsForUserGroupsCreate,
    alterResponseErrorToFaramError,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';

export default class UserGroupPostRequest {
    constructor(props) {
        this.props = props;
    }

    create = ({ title }, userId) => {
        const userGroupCreateRequest = new FgRestBuilder()
            .url(urlForUserGroups)
            .params(() => createParamsForUserGroupsCreate({ title }))
            .preLoad(() => {
                this.props.setState({ pending: true });
            })
            .postLoad(() => {
                this.props.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupCreateResponse');
                    this.props.setUserGroup({
                        userId,
                        userGroup: response,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userGroupCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userGroupCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('userGroupCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.props.setState({ faramErrors });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userGroupCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupCreateFatal'),
                    duration: notify.duration.MEDIUM,
                });
                this.props.setState({
                    // FIXME: use strings
                    faramErrors: { $internal: ['Error while trying to save user group.'] },
                });
            })
            .build();
        return userGroupCreateRequest;
    }
}
