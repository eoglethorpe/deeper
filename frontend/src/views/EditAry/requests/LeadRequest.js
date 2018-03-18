import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLead,
    createParamsForUser,
} from '../../../rest';
import schema from '../../../schema';

export default class LeadRequest {
    constructor(parent) {
        this.setState = (state) => {
            parent.setState(state);
        };
    }

    create = (leadId) => {
        const leadRequest = new FgRestBuilder()
            .url(createUrlForLead(leadId))
            .params(() => createParamsForUser())
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
