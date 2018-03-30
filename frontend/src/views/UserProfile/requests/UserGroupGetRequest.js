import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserGroupsOfUser,
    createParamsForUserGroups,
} from '../../../rest';
import schema from '../../../schema';

export default class UserGroupGetRequest {
    constructor(props) {
        this.props = props;
    }

    create = (userId) => {
        const userGroupsRequest = new FgRestBuilder()
            .url(createUrlForUserGroupsOfUser(userId))
            .params(() => createParamsForUserGroups())
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupsGetResponse');
                    this.props.setUserGroups({
                        userId,
                        userGroups: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return userGroupsRequest;
    }
}
