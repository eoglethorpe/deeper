import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    createUrlForProject,
} from '../../../rest';
import schema from '../../../schema';

export default class ProjectRequest {
    constructor(params) {
        const {
            api,
            setProject,
            startAfRequest,
            startGeoOptionsRequest,
            setState,
        } = params;
        this.setProject = setProject;
        this.api = api;
        this.startAfRequest = startAfRequest;
        this.startGeoOptionsRequest = startGeoOptionsRequest;
        this.setState = setState;
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

                    // Load geo options
                    this.startGeoOptionsRequest(projectId);
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
