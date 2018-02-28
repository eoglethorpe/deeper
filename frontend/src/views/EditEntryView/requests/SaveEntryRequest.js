import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import {
    createParamsForEntryCreate,
    createParamsForEntryEdit,
    createUrlForEntryEdit,
    urlForEntryCreate,
} from '../../../rest';
import { entryAccessor } from '../../../entities/entry';
import schema from '../../../schema';

export default class SaveEntryRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            api,
            changeEntry,
            saveEntry,
            getChoices,
            getEntries,
            getLeadId,
            getCoordinator,
        } = params;
        this.api = api;
        this.changeEntry = changeEntry;
        this.saveEntry = saveEntry;
        this.getChoices = getChoices;
        this.getEntries = getEntries;
        this.getLeadId = getLeadId;
        this.getCoordinator = getCoordinator;
    }

    create = (entryId) => {
        const coordinator = this.getCoordinator();
        const leadId = this.getLeadId();
        const entries = this.getEntries();
        const entry = entries.find(
            e => entryAccessor.getKey(e) === entryId,
        );

        let urlForEntry;
        let paramsForEntry;
        const serverId = entryAccessor.getServerId(entry);
        const values = entryAccessor.getValues(entry);
        if (serverId) {
            urlForEntry = createUrlForEntryEdit(serverId);
            paramsForEntry = createParamsForEntryEdit(values);
        } else {
            urlForEntry = urlForEntryCreate;
            paramsForEntry = createParamsForEntryCreate(values);
        }

        const entrySaveRequest = new FgRestBuilder()
            .url(urlForEntry)
            .params(paramsForEntry)
            .delay(0)
            .preLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [entryId]: { $auto: {
                            pending: { $set: true },
                        } },
                    };
                    const entryRests = update(state.entryRests, requestSettings);
                    return { entryRests };
                });
            })
            .postLoad(() => {
                this.setState((state) => {
                    const requestSettings = {
                        [entryId]: { $auto: {
                            pending: { $set: undefined },
                        } },
                    };
                    const entryRests = update(state.entryRests, requestSettings);
                    return { entryRests };
                });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entry');

                    const data = {
                        versionId: response.versionId,
                        serverId: response.id,
                    };
                    this.saveEntry({ leadId, entryId, data });
                    coordinator.notifyComplete(entryId);
                } catch (er) {
                    console.error(er);
                    const uiState = { error: true };
                    this.changeEntry({ leadId, entryId, uiState });
                    coordinator.notifyComplete(entryId, true);
                }
            })
            .failure((response) => {
                console.warn('FAILURE:', response);
                const uiState = { error: true };
                this.changeEntry({ leadId, entryId, uiState });
                coordinator.notifyComplete(entryId, true);
            })
            .fatal((response) => {
                console.warn('FATAL:', response);
                const uiState = { error: true };
                this.changeEntry({ leadId, entryId, uiState });
                coordinator.notifyComplete(entryId, true);
            })
            .build();

        // Wrap into an actor type for co-ordinator
        const adapter = {
            start: () => {
                const choices = this.getChoices();
                if (choices[entryId].isSaveDisabled) {
                    coordinator.notifyComplete(entryId);
                } else {
                    entrySaveRequest.start();
                }
            },
            stop: entrySaveRequest.stop,
        };

        return adapter;
    }
}
