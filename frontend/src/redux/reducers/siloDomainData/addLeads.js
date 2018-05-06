import {
    listToMap,
    getElementAround,
    getNumbers,
} from '../../../vendor/react-store/utils/common';
import { analyzeErrors } from '../../../vendor/react-store/components/Input/Faram/validator';
import update from '../../../vendor/react-store/utils/immutable-update';

import {
    createLead,
    leadAccessor,
    calcLeadState,
    LEAD_STATUS,
} from '../../../entities/lead';

// ACTION-TYPE

export const LA__SET_FILTERS = 'siloDomainData/LA__SET_FILTERS ';
export const LA__UNSET_FILTERS = 'siloDomainData/LA__UNSET_FILTERS ';

export const LA__SET_ACTIVE_LEAD_ID = 'siloDomainData/LA__SET_ACTIVE_LEAD_ID';

export const LA__ADD_LEADS = 'siloDomainData/LA__ADD_LEADS';

export const LA__LEAD_NEXT = 'siloDomainData/LA__LEAD_NEXT';
export const LA__LEAD_PREV = 'siloDomainData/LA__LEAD_PREV';

export const LA__COPY_ALL_BELOW = 'siloDomainData/LA__COPY_ALL_BELOW';
export const LA__COPY_ALL = 'siloDomainData/LA__COPY_ALL';

export const LA__LEAD_CHANGE = 'siloDomainData/LA__LEAD_CHANGE';
export const LA__LEAD_SAVE = 'siloDomainData/LA__LEAD_SAVE';

export const LA__LEAD_REMOVE = 'siloDomainData/LA__LEAD_REMOVE';
export const LA__LEAD_REMOVE_SAVED = 'siloDomainData/LA__LEAD_REMOVE_SAVED';

export const LA__SET_CONNECTORS = 'siloDomainData/LA__SET_CONNECTORS';
export const LA__SET_CONNECTOR_LEADS = 'siloDomainData/LA__SET_CONNECTOR_LEADS';
export const LA__SET_CONNECTOR_LEAD_SELECTION = 'siloDomainData/LA__SET_CONNECTOR_LEAD_SELECTION';

// ACTION-CREATOR

export const addLeadViewSetFiltersAction = filters => ({
    type: LA__SET_FILTERS,
    filters,
});

export const addLeadViewUnsetFiltersAction = () => ({
    type: LA__UNSET_FILTERS,
});

export const addLeadViewSetActiveLeadIdAction = leadId => ({
    type: LA__SET_ACTIVE_LEAD_ID,
    leadId,
});

export const addLeadViewAddLeadsAction = leads => ({
    type: LA__ADD_LEADS,
    leads,
});

// FIXME: changed this
export const addLeadViewLeadChangeAction = ({
    leadId, faramValues, faramErrors, uiState,
}) => ({
    type: LA__LEAD_CHANGE,
    leadId,
    faramValues,
    faramErrors,
    uiState,
});

export const addLeadViewLeadSaveAction = ({ leadId, serverId }) => ({
    type: LA__LEAD_SAVE,
    leadId,
    serverId,
});

export const addLeadViewLeadRemoveAction = leadId => ({
    type: LA__LEAD_REMOVE,
    leadId,
});

export const addLeadViewRemoveSavedLeadsAction = () => ({
    type: LA__LEAD_REMOVE_SAVED,
});


export const addLeadViewLeadNextAction = () => ({
    type: LA__LEAD_NEXT,
});

export const addLeadViewLeadPrevAction = () => ({
    type: LA__LEAD_PREV,
});

export const addLeadViewCopyAllBelowAction = ({ leadId, attrName }) => ({
    type: LA__COPY_ALL_BELOW,
    leadId,
    attrName,
});

export const addLeadViewCopyAllAction = ({ leadId, attrName }) => ({
    type: LA__COPY_ALL,
    leadId,
    attrName,
});

export const addLeadViewSetConnectorsAction = ({ connectors, projectId }) => ({
    type: LA__SET_CONNECTORS,
    connectors,
    projectId,
});

export const addLeadViewSetConnectorLeadsAction = ({ connectorLeads, connectorId }) => ({
    type: LA__SET_CONNECTOR_LEADS,
    connectorLeads,
    connectorId,
});

export const setConnectorLeadSelectionAction = ({ key, isSelected, connectorId }) => ({
    type: LA__SET_CONNECTOR_LEAD_SELECTION,
    key,
    isSelected,
    connectorId,
});


// NOTE: if leadIndices is not defined, iterates over all leads
const setErrorForLeads = (state, leadIndices) => {
    const { addLeadView: { leads } } = state;

    const newLeadIndices = !leadIndices
        ? getNumbers(0, leads.length)
        : leadIndices;

    const leadSettings = newLeadIndices.reduce(
        (acc, leadIndex) => {
            const lead = leads[leadIndex];
            const faramErrors = leadAccessor.getFaramErrors(lead);
            const hasError = analyzeErrors(faramErrors);
            const serverError = leadAccessor.hasServerError(lead);
            acc[leadIndex] = {
                uiState: {
                    error: { $set: hasError },
                    // clear serverError if there is no error
                    serverError: { $set: !!serverError && hasError },
                },
            };
            return acc;
        },
        {},
    );
    const settings = { addLeadView: { leads: leadSettings } };
    const a = update(state, settings);
    return a;
};

// REDUCER

const addLeadViewSetFilters = (state, action) => {
    const { filters } = action;
    const settings = {
        addLeadView: {
            filters: { $auto: {
                $merge: filters,
            } },
        },
    };
    return update(state, settings);
};

const addLeadViewUnsetFilters = (state) => {
    const settings = {
        addLeadView: {
            filters: { $set: {} },
        },
    };
    return update(state, settings);
};

const addLeadViewSetActiveLead = (state, action) => {
    const { leadId } = action;
    const settings = {
        addLeadView: {
            activeLeadId: { $set: leadId },
        },
    };
    return update(state, settings);
};

const addLeadViewPrevLead = (state) => {
    const { addLeadView: { leads, activeLeadId } } = state;

    const leadIndex = leads.findIndex(
        lead => leadAccessor.getKey(lead) === activeLeadId,
    );
    // Can't go before 0
    if (leadIndex - 1 < 0) {
        return state;
    }

    const newActiveLeadId = leadAccessor.getKey(leads[leadIndex - 1]);
    const settings = {
        addLeadView: {
            activeLeadId: { $set: newActiveLeadId },
        },
    };
    return update(state, settings);
};

const addLeadViewNextLead = (state) => {
    const { addLeadView: { leads, activeLeadId } } = state;

    const leadIndex = leads.findIndex(
        lead => leadAccessor.getKey(lead) === activeLeadId,
    );
    // can't go beyond the length
    if (leadIndex + 1 >= leads.length) {
        return state;
    }

    const newActiveLeadId = leadAccessor.getKey(leads[leadIndex + 1]);
    const settings = {
        addLeadView: {
            activeLeadId: { $set: newActiveLeadId },
        },
    };
    return update(state, settings);
};

const addLeadViewRemoveLead = (state, action) => {
    const { addLeadView: { leads } } = state;

    const { leadId } = action;
    const leadIndex = leads.findIndex(
        lead => leadAccessor.getKey(lead) === leadId,
    );

    // limiting the newActiveid
    const newActiveLead = getElementAround(leads, leadIndex);
    const newActiveLeadId = newActiveLead ? leadAccessor.getKey(newActiveLead) : undefined;

    const settings = {
        addLeadView: {
            leads: { $splice: [[leadIndex, 1]] },
            activeLeadId: { $set: newActiveLeadId },
        },
    };
    return update(state, settings);
};

const addLeadViewRemoveSavedLeads = (state) => {
    const { addLeadView: { activeLeadId } } = state;

    // Remove all saved
    const removalSettings = {
        addLeadView: {
            leads: {
                $filter: (lead) => {
                    const leadState = calcLeadState({ lead });
                    return leadState !== LEAD_STATUS.complete;
                },
            },
        },
    };
    const newState = update(state, removalSettings);

    // Set new active id
    const { addLeadView: { leads } } = newState;
    let newActiveLead = leads.find(lead => leadAccessor.getKey(lead) === activeLeadId);
    if (!newActiveLead && leads.length > 0) {
        newActiveLead = leads[0];
    }
    const newActiveLeadId = newActiveLead ? leadAccessor.getKey(newActiveLead) : undefined;

    const activeIdSettings = {
        addLeadView: {
            activeLeadId: { $set: newActiveLeadId },
        },
    };
    return update(newState, activeIdSettings);
};

const addLeadViewAddNewLeads = (state, action) => {
    const { leads: leadsFromAction } = action;

    // New leads
    const newLeads = leadsFromAction.map(data => createLead(data));

    // New active lead
    const newActiveLead = newLeads[0];
    const newActiveLeadId = leadAccessor.getKey(newActiveLead);

    // For filtering old leads with duplicate serverId
    const serverIdMap = listToMap(
        newLeads,
        lead => leadAccessor.getServerId(lead),
        () => true,
    );
    const filterFn = (lead) => {
        const serverId = leadAccessor.getServerId(lead);
        if (!serverId) {
            return true;
        }
        return !serverIdMap[serverId];
    };

    const settings = {
        addLeadView: {
            activeLeadId: { $set: newActiveLeadId },
            leads: {
                $bulk: [
                    { $filter: filterFn },
                    { $unshift: newLeads },
                ],
            },
            // clear out filters
            filters: {
                $set: {
                    search: '',
                    type: [],
                    source: '',
                    status: '',
                },
            },
        },
    };
    return update(state, settings);
};

// Complex reducers below this point

const addLeadViewChangeLead = (state, action) => {
    const { addLeadView: { leads } } = state;
    const {
        leadId,
        faramValues,
        faramErrors,
        uiState,
    } = action;

    const leadIndex = leads.findIndex(
        lead => leadAccessor.getKey(lead) === leadId,
    );

    const settings = {
        addLeadView: {
            leads: {
                [leadIndex]: {
                    faramValues: {
                        $if: [
                            !!faramValues,
                            { $set: faramValues },
                        ],
                    },
                    faramErrors: {
                        $if: [
                            !!faramErrors,
                            { $set: faramErrors },
                        ],
                    },
                    uiState: {
                        $if: [
                            !!uiState,
                            { $merge: uiState },
                        ],
                    },
                },
            },
        },
    };
    const newState = update(state, settings);

    return setErrorForLeads(newState, [leadIndex]);
};

const addLeadViewCopyAll = behavior => (state, action) => {
    const { addLeadView: { leads } } = state;
    const {
        leadId,
        attrName,
    } = action;


    const leadIndex = leads.findIndex(
        lead => leadAccessor.getKey(lead) === leadId,
    );
    const leadValues = leadAccessor.getFaramValues(leads[leadIndex]);
    const leadProjectId = leadValues.project;
    const valueToCopy = leadValues[attrName];

    const leadSettings = {};
    const start = (behavior === 'below') ? (leadIndex + 1) : 0;
    for (let i = start; i < leads.length; i += 1) {
        const currValues = leadAccessor.getFaramValues(leads[i]);
        const currProjectId = currValues.project;
        // assignee should only be applied to leads within same project
        if (attrName === 'assignee' && currProjectId !== leadProjectId) {
            continue; // eslint-disable-line no-continue
        }

        // Don't set value which hasn't changed
        if (currValues[attrName] === valueToCopy) {
            continue; // eslint-disable-line no-continue
        }

        leadSettings[i] = {
            faramValues: { [attrName]: { $set: valueToCopy } },
            faramErrors: {
                $internal: { $set: undefined },
                [attrName]: { $set: undefined },
            },
            uiState: { pristine: { $set: false } },
        };
    }

    const settings = {
        addLeadView: { leads: leadSettings },
    };
    const newState = update(state, settings);
    return setErrorForLeads(newState);
};

const addLeadViewSaveLead = (state, action) => {
    const { addLeadView: { leads } } = state;
    const {
        leadId,
        serverId,
    } = action;

    const leadIndex = leads.findIndex(
        lead => leadAccessor.getKey(lead) === leadId,
    );

    const settings = {
        addLeadView: {
            leads: {
                [leadIndex]: {
                    serverId: { $set: serverId },
                    uiState: {
                        $merge: { pristine: true },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const addLeadViewSetConnectors = (state, action) => {
    const {
        connectors,
        projectId,
    } = action;

    const settings = {
        addLeadView: {
            connectorsList: { $auto: {
                [projectId]: { $set: connectors },
            } },
        },
    };
    return update(state, settings);
};

const addLeadViewSetConnectorLeads = (state, action) => {
    const {
        connectorLeads,
        connectorId,
    } = action;

    const settings = {
        addLeadView: {
            connectorsLeads: { $auto: {
                [connectorId]: { $set: connectorLeads },
            } },
        },
    };
    return update(state, settings);
};

const setConnectorLeadSelection = (state, action) => {
    const { addLeadView: { connectorsLeads } } = state;
    const {
        key,
        isSelected,
        connectorId,
    } = action;

    console.warn(connectorsLeads, action);
    const index = connectorsLeads[connectorId].findIndex(l => l.key === key);

    if (index === -1) {
        return null;
    }

    const settings = {
        addLeadView: {
            connectorsLeads: { $auto: {
                [connectorId]: {
                    [index]: { $auto: {
                        isSelected: { $set: isSelected },
                    } },
                },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [LA__ADD_LEADS]: addLeadViewAddNewLeads,
    [LA__SET_FILTERS]: addLeadViewSetFilters,
    [LA__UNSET_FILTERS]: addLeadViewUnsetFilters,
    [LA__LEAD_CHANGE]: addLeadViewChangeLead,
    [LA__LEAD_SAVE]: addLeadViewSaveLead,
    [LA__LEAD_REMOVE]: addLeadViewRemoveLead,
    [LA__LEAD_PREV]: addLeadViewPrevLead,
    [LA__LEAD_NEXT]: addLeadViewNextLead,
    [LA__SET_ACTIVE_LEAD_ID]: addLeadViewSetActiveLead,
    [LA__COPY_ALL]: addLeadViewCopyAll('all'),
    [LA__COPY_ALL_BELOW]: addLeadViewCopyAll('below'),
    [LA__LEAD_REMOVE_SAVED]: addLeadViewRemoveSavedLeads,
    [LA__SET_CONNECTORS]: addLeadViewSetConnectors,
    [LA__SET_CONNECTOR_LEADS]: addLeadViewSetConnectorLeads,
    [LA__SET_CONNECTOR_LEAD_SELECTION]: setConnectorLeadSelection,
};
export default reducers;
