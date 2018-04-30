import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    createUrlForUsers,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';

export default class ConnectorsGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        const { setUsers } = this.props;
        try {
            schema.validate(response, 'usersGetResponse');
            setUsers({ users: response.results });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: this.props.notificationStrings('usersTitle'),
            type: notify.type.ERROR,
            message: this.props.notificationStrings('usersListGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = (response) => {
        console.warn('fatal:', response);
    }

    create = () => {
        const usersFields = ['display_name', 'email', 'id'];
        const userListGetRequest = new FgRestBuilder()
            .url(createUrlForUsers(usersFields))
            .params(createParamsForUser)
            .preLoad(() => { this.props.setState({ userDataLoading: true }); })
            .postLoad(() => { this.props.setState({ userDataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return userListGetRequest;
    }
}
