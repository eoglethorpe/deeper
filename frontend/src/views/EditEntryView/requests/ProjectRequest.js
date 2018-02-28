import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    createUrlForProject,
} from '../../../rest';
import schema from '../../../schema';

export default class ProjectRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            api,
            setProject,
            startAfRequest,
        } = params;
        this.setProject = setProject;
        this.api = api;
        this.startAfRequest = startAfRequest;
    }

    create = (projectId, leadId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');

                    this.api.setProject(response);
                    this.setProject({
                        project: response,
                    });

                    // Load analysisFramework
                    const { analysisFramework } = response;
                    this.startAfRequest(analysisFramework, leadId);
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error('Failed loading project of lead');
            })
            .build();
        return projectRequest;
    }
}
