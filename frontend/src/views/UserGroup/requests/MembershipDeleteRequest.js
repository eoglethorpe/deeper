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

    success = (membershipId, userGroupId) => () => {
        try {
            this.props.unSetMembership({
                membershipId,
                userGroupId,
            });
            notify.send({
                title: this.props.notificationStrings('userMembershipDelete'),
                type: notify.type.SUCCESS,
                message: this.props.notificationStrings('userMembershipDeleteSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: this.props.notificationStrings('userMembershipDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('userMembershipDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: this.props.notificationStrings('userMembershipDelete'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('userMembershipDeleteFatal'),
            duration: notify.duration.SLOW,
        });
    }

    create = (membershipId, userGroupId) => {
        const membershipDeleteRequest = new FgRestBuilder()
            .url(createUrlForUserMembership(membershipId))
            .params(createParamsForUserMembershipDelete)
            .preLoad(() => { this.props.setState({ actionPending: true }); })
            .postLoad(() => { this.props.setState({ actionPending: false }); })
            .success(this.success(membershipId, userGroupId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return membershipDeleteRequest;
    }
}
