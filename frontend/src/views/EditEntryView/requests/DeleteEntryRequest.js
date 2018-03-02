import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import {
    createUrlForDeleteEntry,
    createParamsForDeleteEntry,
} from '../../../rest';
import { entryAccessor } from '../../../entities/entry';

export default class DeleteEntryRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            api,
            removeEntry,
            getCoordinator,
            getChoices,
        } = params;
        this.api = api;
        this.removeEntry = removeEntry;
        this.getCoordinator = getCoordinator;
        this.getChoices = getChoices;
    }

    create = (leadId, entry) => {
        const coordinator = this.getCoordinator();

        const id = entryAccessor.getKey(entry);
        const serverId = entryAccessor.getServerId(entry);
        const entriesRequest = new FgRestBuilder()
            .url(createUrlForDeleteEntry(serverId))
            .params(() => createParamsForDeleteEntry())
            .delay(0)
            .preLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [id]: { $auto: {
                            pending: { $set: true },
                        } },
                    };
                    const entryDeleteRests = update(state.entryDeleteRests, requestSettings);
                    return { entryDeleteRests };
                });
            })
            .postLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [id]: { $auto: {
                            pending: { $set: false },
                        } },
                    };
                    const entryDeleteRests = update(state.entryDeleteRests, requestSettings);
                    return { entryDeleteRests };
                });
            })
            .success(() => {
                this.removeEntry({
                    leadId,
                    entryId: id,
                });
                coordinator.notifyComplete(id);
            })
            .failure((response) => {
                console.warn('FAILURE:', response);
                coordinator.notifyComplete(id, true);
            })
            .fatal((response) => {
                console.warn('FATAL:', response);
                coordinator.notifyComplete(id, true);
            })
            .build();

        // Wrap into an actor type for co-ordinator
        const adapter = {
            start: () => {
                const choices = this.getChoices();
                if (choices[id].isSaveDisabled) {
                    coordinator.notifyComplete(id);
                } else {
                    entriesRequest.start();
                }
            },
            stop: entriesRequest.stop,
        };

        return adapter;
    }
}
