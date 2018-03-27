import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLead,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';

export default class LeadRequest {
    constructor(params) {
        const {
            api,
            setLead,
            startProjectRequest,
            setState,
        } = params;
        this.api = api;
        this.setLead = setLead;
        this.startProjectRequest = startProjectRequest;
        this.setState = setState;
    }

    create = (leadId) => {
        const leadRequest = new FgRestBuilder()
            .url(createUrlForLead(leadId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'lead');
                    this.setLead({ lead: response });
                    this.api.setLeadDate(response.publishedOn);

                    // Load project
                    const { project } = response;
                    this.startProjectRequest(project, leadId);
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
                console.error('Failed loading leads');
            })
            .build();
        return leadRequest;
    }
}
