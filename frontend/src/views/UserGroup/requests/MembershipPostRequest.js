import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    urlForUserMembership,
    createParamsForUserMembershipCreate,
    transformResponseErrorToFormError,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';

/*
 * props: setState, setUsersMembership, onModalClose, notificationStrings, userStrings
*/

export default class MembershipPostRequest {
    constructor(props) {
        this.props = props;
    }

    success = userGroupId => (response) => {
        try {
            schema.validate(response, 'userMembershipCreateResponse');
            this.props.setUsersMembership({
                usersMembership: response.results,
                userGroupId,
            });
            notify.send({
                title: this.props.notificationStrings('userMembershipCreate'),
                type: notify.type.SUCCESS,
                message: this.props.notificationStrings('userMembershipCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
            this.props.onModalClose();
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const {
            formFieldErrors,
            formErrors,
        } = transformResponseErrorToFormError(response.errors);
        this.props.setState({
            formFieldErrors,
            formErrors,
        });
    }

    fatal = () => {
        this.props.setState({
            formErrors: { errors: [this.props.userStrings('addMemberErrorText')] },
        });
    }

    create = (memberList, userGroupId) => {
        const membershipCreateRequest = new FgRestBuilder()
            .url(urlForUserMembership)
            .params(() => createParamsForUserMembershipCreate({ memberList }))
            .preLoad(() => { this.props.setState({ pending: true }); })
            .postLoad(() => { this.props.setState({ pending: false }); })
            .success(this.success(userGroupId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return membershipCreateRequest;
    }
}
