import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForEntriesOfLead,
    createParamsForEntriesOfLead,
} from '../../../rest';
import {
    calcEntriesDiff,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
} from '../../../entities/entry';

import notify from '../../../notify';
import schema from '../../../schema';

export default class EntriesRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            api,
            getEntries,
            diffEntries,
            notificationStrings,
        } = params;
        this.api = api;
        this.getEntries = getEntries;
        this.diffEntries = diffEntries;
        this.notificationStrings = notificationStrings;
    }

    create = (leadId) => {
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForEntriesOfLead(leadId))
            .params(() => createParamsForEntriesOfLead())
            .preLoad(() => {
                this.setState({ pendingEntries: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entriesGetResponse');
                    this.setState({ pendingEntries: false });

                    const entries = response.results.entries;
                    const diffs = calcEntriesDiff(this.getEntries(), entries);
                    if (getApplicableDiffCount(diffs) <= 0) {
                        return;
                    }
                    this.diffEntries({ leadId, diffs });

                    if (getApplicableAndModifyingDiffCount(diffs) <= 0) {
                        return;
                    }
                    notify.send({
                        type: notify.type.WARNING,
                        title: this.notificationStrings('entryUpdate'),
                        message: this.notificationStrings('entryUpdateOverridden'),
                        duration: notify.duration.SLOW,
                    });
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
