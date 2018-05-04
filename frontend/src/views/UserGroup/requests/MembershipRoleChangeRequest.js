import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipRoleChange,
} from '../../../rest';
import schema from '../../../schema';
import notify from '../../../notify';
import _ts from '../../../ts';

/*
 * props: setState, setUserMembership
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
                title: _ts('notification', 'userMembershipRole'),
                type: notify.type.SUCCESS,
                message: _ts('notification', 'userMembershipRoleSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: _ts('notification', 'userMembershipRole'),
            type: notify.type.ERROR,
            message: _ts('notification', 'userMembershipRoleFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('notification', 'userMembershipRole'),
            type: notify.type.ERROR,
            message: _ts('notification', 'userMembershipRoleFatal'),
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
