import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipRoleChange,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';

/*
 * props: setState, setUserMembership, notificationStrings
*/

export default class MembershipRoleChangeRequest {
    constructor(props) {
        this.props = props;
    }

    success = userGroupId => (response) => {
        try {
            schema.validate({ results: [response] }, 'userMembershipCreateResponse');
            this.props.setUserMembership({
                userMembership: response,
                userGroupId,
            });
            notify.send({
                title: this.props.notificationStrings('userMembershipRole'),
                type: notify.type.SUCCESS,
                message: this.props.notificationStrings('userMembershipRoleSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: this.props.notificationStrings('userMembershipRole'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('userMembershipRoleFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: this.props.notificationStrings('userMembershipRole'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('userMembershipRoleFatal'),
            duration: notify.duration.SLOW,
        });
    }

    create = ({ membershipId, newRole }, userGroupId) => {
        const membershipRoleChangeRequest = new FgRestBuilder()
            .url(createUrlForUserMembership(membershipId))
            .params(() => createParamsForUserMembershipRoleChange({ newRole }))
            .preLoad(() => { this.props.setState({ actionPending: true }); })
            .postLoad(() => { this.props.setState({ actionPending: false }); })
            .success(this.success(userGroupId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return membershipRoleChangeRequest;
    }
}
