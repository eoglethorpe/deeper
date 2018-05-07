import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import {
    createUrlForEntriesOfLead,
    createParamsForGet,
} from '../../../../../rest';

import schema from '../../../../../schema';

export default class EntriesRequest {
    constructor(params) {
        const {
            setState,
            setEntries,
        } = params;
        this.setState = setState;
        this.setEntries = setEntries;
    }

    create = (leadId) => {
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForEntriesOfLead(leadId))
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({ pendingEntries: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entriesGetResponse');
                    this.setEntries({
                        entries: response.results.entries,
                        leadId,
                        lead: response.results.leads[0],
                    });
                    this.setState({ pendingEntries: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingEntries: false });
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                this.setState({ pendingEntries: false });
                // TODO: notify
                console.error('Failed loading entries of lead');
            })
            .build();
        return entriesRequest;
    }
}
