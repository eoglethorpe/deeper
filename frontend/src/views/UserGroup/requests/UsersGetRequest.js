import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUsers,
    createParamsForUser,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';

/*
 * props: setState, setUsers, notificationStrings
*/
export default class UsersGetRequest {
    constructor(props) {
        this.props = props;

        this.usersFields = ['display_name', 'email', 'id'];
    }

    notifyFail = () => {
        notify.send({
            title: this.props.notificationStrings('userMembershipCreate'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('usersPullFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = () => {
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers([this.usersFields]))
            .params(createParamsForUser)
            .preLoad(() => this.props.setState({ pending: true }))
            .postLoad(() => this.props.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'usersGetResponse');
                    this.props.setUsers({
                        users: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                this.notifyFail();
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.notifyFail();
            })
            .build();
        return usersRequest;
    }
}
