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

    notifySuccess = () => {
        notify.send({
            title: this.props.notificationStrings('userMembershipRole'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('userMembershipRoleSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    notifyFail = (message) => {
        notify.send({
            title: this.props.notificationStrings('userMembershipRole'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings(message),
            duration: notify.duration.MEDIUM,
        });
    }

    create = ({ membershipId, newRole }, userGroupId) => {
        const urlForUserMembershipPatch = createUrlForUserMembership(membershipId);

        const membershipRoleChangeRequest = new FgRestBuilder()
            .url(urlForUserMembershipPatch)
            .params(() => createParamsForUserMembershipRoleChange({ newRole }))
            .preLoad(() => { this.props.setState({ actionPending: true }); })
            .postLoad(() => { this.props.setState({ actionPending: false }); })
            .success((response) => {
                try {
                    schema.validate({ results: [response] }, 'userMembershipCreateResponse');
                    this.props.setUserMembership({
                        userMembership: response,
                        userGroupId,
                    });
                    this.notifySuccess();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                this.notifyFail('userMembershipRoleFailure');
            })
            .fatal(() => {
                this.notifyFail('userMembershipRoleFatal');
            })
            .build();
        return membershipRoleChangeRequest;
    }
}
