import {
    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,

    SET_ADD_LEAD_VIEW_FILTERS,
    SET_ADD_LEAD_VIEW_ACTIVE_LEAD_ID,
    ADD_ADD_LEAD_VIEW_LEADS,
    ADD_LEAD_VIEW_LEAD_CHANGE,
    ADD_LEAD_VIEW_LEAD_SET_PENDING,
    ADD_LEAD_VIEW_LEAD_SAVE,
    ADD_LEAD_VIEW_LEAD_REMOVE,
    ADD_LEAD_VIEW_LEAD_NEXT,
    ADD_LEAD_VIEW_LEAD_PREV,

    SET_LEAD_PAGE_FILTER,
    SET_LEAD_PAGE_ACTIVE_PAGE,
    SET_LEAD_PAGE_ACTIVE_SORT,
} from '../action-types/siloDomainData';

import {
    SET_USER_PROJECTS,
} from '../action-types/domainData';

import initialSiloDomainData from '../initial-state/siloDomainData';
import update from '../../public/utils/immutable-update';

// UTILS
// TODO move this

const strMatchesSub = (str, sub) => (str.toLowerCase().includes(sub.toLowerCase()));

const statusMatch = (status, { error, stale, serverId }) => {
    switch (status) {
        /*
        case 'other':
            return !error && !serverId && !stale;
        */
        case 'saved':
            return !error && serverId && !stale;
        case 'unsaved':
            return !error && stale;
        case 'invalid':
            return error;
        default:
            return false;
    }
};

const leadReference = {
    data: {
        id: 'lead-0',
        type: 'void',
    },
    form: {
        values: {
            title: 'Lead #0',
            project: 0,
        },
        errors: [],
        fieldErrors: {},
    },
    uiState: {
        error: false,
        pending: false,
        ready: true,
        stale: false,
    },
    isFiltrate: true,
    upload: {
        title: undefined,
        errorMessage: undefined,
    },
};

const createLead = ({ id, type, title, projectId, ready = true, stale = true }) => {
    const settings = {
        data: {
            id: { $set: id },
            type: { $set: type },
        },
        form: { values: {
            title: { $set: title },
            project: { $set: projectId },
        } },
        uiState: {
            ready: { $set: ready },
            stale: { $set: stale },
        },
    };
    return update(leadReference, settings);
};

// REDUCERS

const setActiveProject = (state, action) => {
    const { activeProject } = action;
    const settings = {
        activeProject: {
            $set: activeProject,
        },
    };
    return update(state, settings);
};

// Only set new active project in this reducer
const setUserProjects = (state, action) => {
    const { projects } = action;
    // If there is no projects, then no need to update active project
    if (!projects || projects.length <= 0) {
        return state;
    }

    // XXX: Verify this
    const { activeProject } = state;
    let activeIndex = action.projects.findIndex(project => project.id === activeProject);
    if (activeIndex < 0) {
        activeIndex = 0;
    }

    const settings = {
        activeProject: { $set: action.projects[activeIndex].id },
    };
    return update(state, settings);
};

const setActiveCountry = (state, action) => {
    const { activeCountry } = action;
    const settings = {
        activeCountry: { $set: activeCountry },
    };
    return update(state, settings);
};

const addLeadViewAddNewLeads = (state, action) => {
    const { leads } = action;
    if (!leads || leads.length <= 0) {
        return state;
    }

    const newLeads = leads.map(data => createLead(data));

    const settings = {
        addLeadView: {
            // set first leads a new active lead
            activeLeadId: { $set: newLeads[0].data.id },
            // add new leads to start
            leads: { $unshift: newLeads },
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
    const newState = update(state, settings);

    const leadsSettings = { addLeadView: { leads: {} } };
    newState.addLeadView.leads.forEach((lead, i) => {
        // clear out filter side-effects
        leadsSettings.addLeadView.leads[i] = { isFiltrate: { $set: true } };
    });
    return update(newState, leadsSettings);
};

const addLeadViewSetFilters = (state, action) => {
    // set new filters
    const settings = {
        addLeadView: {
            filters: { $merge: action.filters },
        },
    };
    const newState = update(state, settings);

    // filter side-effects
    const {
        search,
        type,
        source,
        status,
    } = newState.addLeadView.filters;

    const leadsSettings = { addLeadView: { leads: {} } };
    newState.addLeadView.leads.forEach((lead, i) => {
        const { serverId, data, form, uiState } = lead;
        const { type: leadType } = data;
        const {
            title: leadTitle = '',
            source: leadSource = '',
        } = form.values;

        const {
            error,
            stale,
        } = uiState;

        const alias = leadsSettings.addLeadView.leads;
        if (search.length !== 0 && !strMatchesSub(leadTitle, search)) {
            alias[i] = { isFiltrate: { $set: false } };
        } else if (source.length !== 0 && !strMatchesSub(leadSource, source)) {
            alias[i] = { isFiltrate: { $set: false } };
        } else if (type.length !== 0 && type.indexOf(leadType) === -1) {
            alias[i] = { isFiltrate: { $set: false } };
        } else if (status && status.length !== 0 &&
              !statusMatch(status, { error, stale, serverId })) {
            alias[i] = { isFiltrate: { $set: false } };
        } else {
            alias[i] = { isFiltrate: { $set: true } };
        }
    });
    return update(newState, leadsSettings);
};

const addLeadViewChangeLead = (state, action) => {
    const {
        leadId,
        values = {},
        formFieldErrors = {},

        formErrors,
        upload,
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
    if (upload) {
        settings.addLeadView.leads[index].upload = { $merge: upload };
    }
    const newState = update(state, settings);

    // set error flag for uiState
    const ld = newState.addLeadView.leads[index];
    let error = false;
    if (ld.upload.errorMessage) {
        error = true;
    } else if (ld.form.errors && ld.form.errors.length > 0) {
        error = true;
    } else {
        const errorList = ld.form.fieldErrors;
        error = Object.keys(errorList).some(key => !!errorList[key]);
    }
    const newSettings = {
        addLeadView: {
            leads: {
                [index]: {
                    uiState: {
                        error: { $set: error },
                    },
                },
            },
        },
    };
    return update(newState, newSettings);
};

const addLeadViewLeadSetPending = (state, action) => {
    const {
        leadId,
        pending,
    } = action;

    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === leadId,
    );

    const settings = {
        addLeadView: {
            leads: {
                [index]: {
                    uiState: {
                        pending: {
                            $set: pending,
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
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
                    uiState: {
                        $merge: {
                            pending: false,
                            stale: false,
                        },
                    },
                    serverId: { $set: serverId },
                },
            },
        },
    };
    return update(state, settings);
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
    if (index - 1 >= 0) {
        newActiveId = state.addLeadView.leads[index - 1].data.id;
    } else if (index + 1 < state.addLeadView.leads.length) {
        newActiveId = state.addLeadView.leads[index + 1].data.id;
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


const leadViewSetFilter = (state, action) => {
    console.warn(action);
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                filter: { $auto: { $merge: filters } },
                activePage: { $set: 1 },
            } },
        },
    };
    console.warn(settings);
    return update(state, settings);
};

const leadViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                activePage: { $set: activePage },
            } },
        },
    };
    return update(state, settings);
};

const leadViewSetActiveSort = (state, action) => {
    const { activeSort } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                activeSort: { $set: activeSort },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const siloDomainDataReducer = (state = initialSiloDomainData, action) => {
    switch (action.type) {
        case SET_USER_PROJECTS:
            return setUserProjects(state, action);
        case SET_ACTIVE_PROJECT:
            return setActiveProject(state, action);
        case SET_ACTIVE_COUNTRY:
            return setActiveCountry(state, action);

        case ADD_ADD_LEAD_VIEW_LEADS:
            return addLeadViewAddNewLeads(state, action);
        case SET_ADD_LEAD_VIEW_FILTERS:
            return addLeadViewSetFilters(state, action);
        case ADD_LEAD_VIEW_LEAD_CHANGE:
            return addLeadViewChangeLead(state, action);
        case ADD_LEAD_VIEW_LEAD_SET_PENDING:
            return addLeadViewLeadSetPending(state, action);
        case ADD_LEAD_VIEW_LEAD_SAVE:
            return addLeadViewSaveLead(state, action);
        case ADD_LEAD_VIEW_LEAD_REMOVE:
            return addLeadViewRemoveLead(state, action);
        case ADD_LEAD_VIEW_LEAD_PREV:
            return addLeadViewPrevLead(state);
        case ADD_LEAD_VIEW_LEAD_NEXT:
            return addLeadViewNextLead(state);
        case SET_ADD_LEAD_VIEW_ACTIVE_LEAD_ID:
            return addLeadViewSetActiveLead(state, action);

        case SET_LEAD_PAGE_FILTER:
            return leadViewSetFilter(state, action);
        case SET_LEAD_PAGE_ACTIVE_PAGE:
            return leadViewSetActivePage(state, action);
        case SET_LEAD_PAGE_ACTIVE_SORT:
            return leadViewSetActiveSort(state, action);
        default:
            return state;
    }
};

export default siloDomainDataReducer;
