import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    urlForUserMembership,
    createParamsForUserMembershipCreate,
    alterResponseErrorToFaramError,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';
import _ts from '../../../ts';

/*
 * props: setState, setUsersMembership, onModalClose
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
                title: _ts('notification', 'userMembershipCreate'),
                type: notify.type.SUCCESS,
                message: _ts('notification', 'userMembershipCreateSuccess'),
                duration: notify.duration.MEDIUM,
            });
            this.props.onModalClose();
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.props.setState({ faramErrors });
    }

    fatal = () => {
        this.props.setState({
            faramErrors: { $internal: [_ts('user', 'addMemberErrorText')] },
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
