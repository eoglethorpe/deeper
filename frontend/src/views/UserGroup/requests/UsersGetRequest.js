import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUsers,
    createParamsForGet,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';
import _ts from '../../../ts';

/*
 * props: setState, setUsers
*/
export default class UsersGetRequest {
    constructor(props) {
        this.props = props;

        this.usersFields = ['display_name', 'email', 'id'];
    }

    success = (response) => {
        try {
            schema.validate(response, 'usersGetResponse');
            this.props.setUsers({
                users: response.results,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        console.warn('FAILURE:', response);
        notify.send({
            title: _ts('notification', 'userMembershipCreate'),
            type: notify.type.ERROR,
            message: _ts('notification', 'usersPullFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = (response) => {
        console.warn('FATAL:', response);
        notify.send({
            title: _ts('notification', 'userMembershipCreate'),
            type: notify.type.ERROR,
            message: _ts('notification', 'usersPullFailure'),
            duration: notify.duration.SLOW,
        });
    }

    create = () => {
        const usersRequest = new FgRestBuilder()
            .url(createUrlForUsers([this.usersFields]))
            .params(createParamsForGet)
            .preLoad(() => this.props.setState({ pending: true }))
            .postLoad(() => this.props.setState({ pending: false }))
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return usersRequest;
    }
}
