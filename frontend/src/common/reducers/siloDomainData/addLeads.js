import { listToMap, getNumbers } from '../../../public/utils/common';
import update from '../../../public/utils/immutable-update';
import {
    LA__SET_FILTERS,
    LA__UNSET_FILTERS,
    LA__SET_ACTIVE_LEAD_ID,
    LA__ADD_LEADS,
    LA__LEAD_CHANGE,
    LA__LEAD_SAVE,
    LA__LEAD_REMOVE,
    LA__LEAD_NEXT,
    LA__LEAD_PREV,
    LA__COPY_ALL,
    LA__COPY_ALL_BELOW,
} from '../../action-types/siloDomainData';

import {
    createLead,
    leadAccessor,
} from '../../entities/lead';

// HELPER

const hasError = (state, leadIndex) => {
    const { addLeadView: { leads } } = state;
    const lead = leads[leadIndex];
    // TODO: check if we actually use errors inside form
    const { form: { errors, fieldErrors } } = lead;
    if (errors && errors.length > 0) {
        return true;
    }
    return Object.keys(fieldErrors).some(key => !!fieldErrors[key]);
};

// NOTE: if leadIndices is not defined, iterates over all leads
const setErrorForLeads = (state, leadIndices) => {
    const { addLeadView: { leads } } = state;

    const newLeadIndices = !leadIndices
        ? getNumbers(0, leads.length)
        : leadIndices;

    const leadSettings = newLeadIndices.reduce(
        (acc, leadIndex) => {
            const error = hasError(state, leadIndex);
            acc[leadIndex] = {
                uiState: {
                    error: { $set: error },
                },
            };
            return acc;
        },
        {},
    );
    const settings = { addLeadView: { leads: leadSettings } };
    return update(state, settings);
};

// REDUCER

const addLeadViewSetFilters = (state, action) => {
    const { filters } = action;
    // set new filters
    const settings = {
        addLeadView: {
            filters: { $auto: {
                $merge: filters,
            } },
        },
    };
    return update(state, settings);
};

const removeLeadViewSetFilters = (state) => {
    // remove filters
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
    let newActiveLeadId;
    if (leadIndex + 1 < leads.length) {
        newActiveLeadId = leadAccessor.getKey(leads[leadIndex + 1]);
    } else if (leadIndex - 1 >= 0) {
        newActiveLeadId = leadAccessor.getKey(leads[leadIndex - 1]);
    }

    const settings = {
        addLeadView: {
            leads: { $splice: [[leadIndex, 1]] },
            activeLeadId: { $set: newActiveLeadId },
        },
    };
    return update(state, settings);
};

const addLeadViewAddNewLeads = (state, action) => {
    const { leads: leadsFromAction } = action;
    // Adding new leads
    const newLeads = leadsFromAction.map(data => createLead(data));
    const newActiveLeadId = leadAccessor.getKey(newLeads[0]);

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
            // set first leads a new active lead
            activeLeadId: { $set: newActiveLeadId },
            // add new leads to start
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

const addLeadViewChangeLead = (state, action) => {
    const { addLeadView: { leads } } = state;
    const {
        leadId,
        values = {},
        formFieldErrors = {},

        formErrors,
        uiState,
    } = action;

    const leadIndex = leads.findIndex(
        lead => leadAccessor.getKey(lead) === leadId,
    );

    const settings = {
        addLeadView: {
            leads: {
                [leadIndex]: {
                    form: {
                        values: { $merge: values },
                        fieldErrors: { $merge: formFieldErrors },
                        errors: {
                            $if: [
                                !!formErrors,
                                { $set: formErrors },
                            ],
                        },
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
                    data: { $auto: {
                        serverId: { $set: serverId },
                    } },
                    uiState: {
                        $merge: { pristine: true },
                    },
                },
            },
        },
    };
    return update(state, settings);
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
    const leadValues = leadAccessor.getValues(leads[leadIndex]);
    const leadProjectId = leadValues.project;
    const valueToCopy = leadValues[attrName];

    const leadSettings = {};
    const start = (behavior === 'below') ? (leadIndex + 1) : 0;
    for (let i = start; i < leads.length; i += 1) {
        const currValues = leadAccessor.getValues(leads[i]);
        const currProjectId = currValues.project;

        // assignee should only be applied to leads within same project
        if (attrName === 'assignee' && currProjectId !== leadProjectId) {
            continue; // eslint-disable-line no-continue
        }

        leadSettings[i] = {
            form: {
                values: { [attrName]: { $set: valueToCopy } },
                fieldErrors: { [attrName]: { $set: undefined } },
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

// REDUCER MAP

const reducers = {
    [LA__ADD_LEADS]: addLeadViewAddNewLeads,
    [LA__SET_FILTERS]: addLeadViewSetFilters,
    [LA__UNSET_FILTERS]: removeLeadViewSetFilters,
    [LA__LEAD_CHANGE]: addLeadViewChangeLead,
    [LA__LEAD_SAVE]: addLeadViewSaveLead,
    [LA__LEAD_REMOVE]: addLeadViewRemoveLead,
    [LA__LEAD_PREV]: addLeadViewPrevLead,
    [LA__LEAD_NEXT]: addLeadViewNextLead,
    [LA__SET_ACTIVE_LEAD_ID]: addLeadViewSetActiveLead,
    [LA__COPY_ALL]: addLeadViewCopyAll('all'),
    [LA__COPY_ALL_BELOW]: addLeadViewCopyAll('below'),
};
export default reducers;
