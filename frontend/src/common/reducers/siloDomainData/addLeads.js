import { getNumbers } from '../../../public/utils/common';
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

import { createLead } from '../../entities/lead';

// HELPER

const hasError = (newState, leadIndex) => {
    const ld = newState.addLeadView.leads[leadIndex];
    if (ld.form.errors && ld.form.errors.length > 0) {
        return true;
    }
    const errorList = ld.form.fieldErrors;
    return Object.keys(errorList).some(key => !!errorList[key]);
};

const setErrorForLeads = (state, leadIndices) => {
    const newLeadIndices = !leadIndices
        ? getNumbers(0, state.addLeadView.leads.length)
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

const addLeadViewAddNewLeads = (state, action) => {
    const { leads } = action;
    if (!leads || leads.length <= 0) {
        return state;
    }

    const newLeads = leads.map(data => createLead(data));

    const serverIdMap = newLeads.reduce(
        (acc, lead) => {
            if (lead.data && lead.data.serverId) {
                acc[lead.data.serverId] = true;
            }
            return acc;
        },
        {},
    );

    // TODO: splice works only on when on lead is added (that has serverId)
    const spliceSettings = state.addLeadView.leads.reduce(
        (acc, lead, i) => {
            if (lead.data && lead.data.serverId && serverIdMap[lead.data.serverId]) {
                acc.push([i, 1]);
            }
            return acc;
        },
        [],
    );
    spliceSettings.push([0, 0, ...newLeads]);

    const settings = {
        addLeadView: {
            // set first leads a new active lead
            activeLeadId: { $set: newLeads[0].data.id },
            // add new leads to start
            leads: { $splice: spliceSettings },
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

const addLeadViewSetFilters = (state, action) => {
    // set new filters
    const settings = {
        addLeadView: {
            filters: { $merge: action.filters },
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

const addLeadViewChangeLead = (state, action) => {
    const {
        leadId,
        values = {},
        formFieldErrors = {},

        formErrors,
        uiState,
    } = action;

    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === leadId,
    );

    const settings = {
        addLeadView: { leads: { [index]: { form: { } } } },
    };
    settings.addLeadView.leads[index].form.values = { $merge: values };
    settings.addLeadView.leads[index].form.fieldErrors = { $merge: formFieldErrors };
    if (formErrors) {
        settings.addLeadView.leads[index].form.errors = { $set: formErrors };
    }
    if (uiState) {
        settings.addLeadView.leads[index].uiState = { $merge: uiState };
    }
    const newState = update(state, settings);

    return setErrorForLeads(newState, [index]);
};

const addLeadViewSaveLead = (state, action) => {
    const {
        leadId,
        serverId,
    } = action;

    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === leadId,
    );

    const settings = {
        addLeadView: {
            leads: {
                [index]: {
                    data: { $auto: {
                        serverId: { $set: serverId },
                    } },
                    uiState: {
                        $merge: {
                            pristine: true,
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const addLeadViewCopyAll = (state, action, behavior) => {
    const {
        leadId,
        attrName,
    } = action;

    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === leadId,
    );

    const leadProjectId = state.addLeadView.leads[index].form.values.project;

    const start = behavior === 'below' ? (index + 1) : 0;

    const valueToCopy = state.addLeadView.leads[index].form.values[attrName];
    const leadSettings = {};
    for (let i = start; i < state.addLeadView.leads.length; i += 1) {
        const currLeadProjectId = state.addLeadView.leads[i].form.values.project;
        if (attrName === 'assignee' && currLeadProjectId !== leadProjectId) {
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

    // put pristine (remove error for that as well)

    const settings = {
        addLeadView: {
            leads: leadSettings,
        },
    };
    const newState = update(state, settings);
    return setErrorForLeads(newState);
};

const addLeadViewSetActiveLead = (state, action) => {
    const { leadId } = action;
    const settings = {
        addLeadView: {
            activeLeadId: {
                $set: leadId,
            },
        },
    };
    return update(state, settings);
};

const addLeadViewPrevLead = (state) => {
    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === state.addLeadView.activeLeadId,
    );
    if (index - 1 < 0) {
        return state;
    }

    const newActiveId = state.addLeadView.leads[index - 1].data.id;
    const settings = {
        addLeadView: {
            activeLeadId: { $set: newActiveId },
        },
    };
    return update(state, settings);
};

const addLeadViewNextLead = (state) => {
    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === state.addLeadView.activeLeadId,
    );
    if (index + 1 >= state.addLeadView.leads.length) {
        return state;
    }

    const newActiveId = state.addLeadView.leads[index + 1].data.id;
    const settings = {
        addLeadView: {
            activeLeadId: { $set: newActiveId },
        },
    };
    return update(state, settings);
};

const addLeadViewRemoveLead = (state, action) => {
    const { leadId } = action;
    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === leadId,
    );

    let newActiveId;
    if (index + 1 < state.addLeadView.leads.length) {
        newActiveId = state.addLeadView.leads[index + 1].data.id;
    } else if (index - 1 >= 0) {
        newActiveId = state.addLeadView.leads[index - 1].data.id;
    }

    const settings = {
        addLeadView: {
            leads: {
                $splice: [[index, 1]],
            },
            activeLeadId: { $set: newActiveId },
        },
    };
    return update(state, settings);
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
    [LA__COPY_ALL]: addLeadViewCopyAll,
    [LA__COPY_ALL_BELOW]: (state, action) => addLeadViewCopyAll(state, action, 'below'),
};
export default reducers;
