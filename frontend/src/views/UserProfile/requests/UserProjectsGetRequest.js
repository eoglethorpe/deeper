import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForProjectsOfUser,
    createParamsForGet,
} from '../../../rest';
import schema from '../../../schema';

export default class UserProjectsGetRequest {
    constructor(props) {
        this.props = props;
    }

    create = (userId) => {
        const projectsRequest = new FgRestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'projectsGetResponse');
                    this.props.setUserProjects({
                        userId,
                        projects: response.results,
                        extra: response.extra,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return projectsRequest;
    }
}
