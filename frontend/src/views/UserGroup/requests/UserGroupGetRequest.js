import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserGroup,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';

/*
 * props: setState, setUserGroup, unSetUserGroup
*/
export default class UserGroupGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'userGroupGetResponse');
            this.props.setUserGroup({
                userGroup: response,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = id => (response) => {
        if (response.errorCode === 404) {
            this.props.unSetUserGroup({ userGroupId: id });
        } else {
            console.info('FAILURE:', response);
        }
    }

    fatal = (response) => {
        console.info('FATAL:', response);
    }

    create = (id) => {
        const userGroupRequest = new FgRestBuilder()
            .url(createUrlForUserGroup(id))
            .params(createParamsForUser)
            .preLoad(() => { this.props.setState({ pending: true }); })
            .postLoad(() => { this.props.setState({ pending: false }); })
            .success(this.success)
            .failure(this.failure(id))
            .fatal(this.fatal)
            .build();
        return userGroupRequest;
    }
}
