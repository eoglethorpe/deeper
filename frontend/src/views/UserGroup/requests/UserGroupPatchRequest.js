import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserGroup,
    createParamsForUserGroupsPatch,
    transformResponseErrorToFormError,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';

/*
 * props: setState, setUserGroup, handleModalClose, userStrings, notificationStrings
*/
export default class UserGroupPatchRequest {
    constructor(props) {
        this.props = props;
    }

    notifySuccess = () => {
        notify.send({
            title: this.props.notificationStrings('userGroupEdit'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('userGroupEditSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    notifyFail = (message) => {
        notify.send({
            title: this.props.notificationStrings('userGroupEdit'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings(message),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (userGroupId, { title, description }) => {
        const urlForUserGroup = createUrlForUserGroup(userGroupId);
        const userGroupCreateRequest = new FgRestBuilder()
            .url(urlForUserGroup)
            .params(() => createParamsForUserGroupsPatch({ title, description }))
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
                        userGroup: response,
                    });
                    this.notifySuccess();
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.notifyFail('userGroupEditFailure');
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.props.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                this.notifyFail('userGroupEditFatal');
                this.props.setState({
                    formErrors: { errors: [
                        this.props.userStrings('userGroupPatchFatal'),
                    ] },
                });
            })
            .build();
        return userGroupCreateRequest;
    }
}
