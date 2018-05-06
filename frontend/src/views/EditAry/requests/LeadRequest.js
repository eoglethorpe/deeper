import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLead,
    createParamsForGet,
} from '../../../rest';
import schema from '../../../schema';

export default class LeadRequest {
    constructor(params) {
        const { setState } = params;
        this.setState = setState;
    }

    create = (leadId) => {
        const leadRequest = new FgRestBuilder()
            .url(createUrlForLead(leadId))
            .params(createParamsForGet)
            .preLoad(() => this.setState({ pendingLead: true }))
            .postLoad(() => this.setState({ pendingLead: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'lead');
                    this.setState({ lead: response });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                // TODO: notify
                console.error('Failed loading leads');
            })
            .build();
        return leadRequest;
    }
}
