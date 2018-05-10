import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForGet,
    createUrlForLeadGroupsOfProject,
} from '../../../rest';
import _ts from '../../../ts';

import schema from '../../../schema';
import notify from '../../../notify';

export default class LeadGroupsRequest {
    constructor(props) {
        this.props = props;
    }

    success = projectId => (response) => {
        try {
            console.warn(projectId, response);
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        console.warn('failure:', response);
    }

    fatal = (response) => {
        console.warn('fatal:', response);
    }

    create = (projectId) => {
        const leadGroupsRequest = new FgRestBuilder()
            .url(createUrlForLeadGroupsOfProject(projectId))
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ leadGroupsDataLoading: true }); })
            .postLoad(() => { this.props.setState({ leadGroupsDataLoading: false }); })
            .success(this.success(projectId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return leadGroupsRequest;
    }
}
