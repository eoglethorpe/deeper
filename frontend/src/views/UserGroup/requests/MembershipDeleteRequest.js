import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipDelete,
} from '../../../rest';
import notify from '../../../notify';

/*
 * props: setState, unSetMembership, notificationStrings
*/

export default class MembershipDeleteRequest {
    constructor(props) {
        this.props = props;
    }

    notifySuccess = () => {
        notify.send({
            title: this.props.notificationStrings('userMembershipDelete'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('userMembershipDeleteSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    notifyFail = (message) => {
        notify.send({
            title: this.props.notificationStrings('userMembershipDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings(message),
            duration: notify.duration.MEDIUM,
        });
    }

    create = (membershipId, userGroupId) => {
        const urlForMembership = createUrlForUserMembership(membershipId);

        const membershipDeleteRequest = new FgRestBuilder()
            .url(urlForMembership)
            .params(createParamsForUserMembershipDelete)
            .preLoad(() => { this.props.setState({ actionPending: true }); })
            .postLoad(() => { this.props.setState({ actionPending: false }); })
            .success(() => {
                try {
                    this.props.unSetMembership({
                        membershipId,
                        userGroupId,
                    });
                    this.notifySuccess();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                this.notifyFail('userMembershipDeleteFailure');
            })
            .fatal(() => {
                this.notifyFail('userMembershipDeleteFatal');
            })
            .build();
        return membershipDeleteRequest;
    }
}
