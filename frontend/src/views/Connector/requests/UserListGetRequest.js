import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForGet,
    createUrlForUsers,
} from '../../../rest';

import schema from '../../../schema';
import notify from '../../../notify';
import _ts from '../../../ts';

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

    failure = (response) => {
        notify.send({
            title: _ts('notification', 'usersTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('notification', 'usersTitle'),
            type: notify.type.ERROR,
            message: _ts('notification', 'usersListGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = () => {
        const usersFields = ['display_name', 'email', 'id'];
        const userListGetRequest = new FgRestBuilder()
            .url(createUrlForUsers(usersFields))
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ userDataLoading: true }); })
            .postLoad(() => { this.props.setState({ userDataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return userListGetRequest;
    }
}
