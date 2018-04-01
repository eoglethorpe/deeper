import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForUserGroupProjects,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';

/*
 * props: setUserGroupProject
*/

export default class UserGroupProjectsRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        try {
            schema.validate(response, 'projectsGetResponse');
            this.props.setUserGroupProject({
                projects: response.results,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        console.info('FAILURE:', response);
    }

    fatal = (response) => {
        console.info('FATAL:', response);
    }

    create = (id) => {
        const urlForUserGroupProjects = createUrlForUserGroupProjects(id);
        const userGroupRequest = new FgRestBuilder()
            .url(urlForUserGroupProjects)
            .params(createParamsForUser)
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return userGroupRequest;
    }
}
