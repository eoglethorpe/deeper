import {
    SET_LEADS,

    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,

    SET_ADD_LEAD_VIEW_FILTERS,
    UNSET_ADD_LEAD_VIEW_FILTERS,
    SET_ADD_LEAD_VIEW_ACTIVE_LEAD_ID,
    ADD_ADD_LEAD_VIEW_LEADS,
    ADD_LEAD_VIEW_LEAD_CHANGE,
    ADD_LEAD_VIEW_LEAD_SAVE,
    ADD_LEAD_VIEW_LEAD_REMOVE,
    ADD_LEAD_VIEW_LEAD_NEXT,
    ADD_LEAD_VIEW_LEAD_PREV,

    SET_LEAD_PAGE_FILTER,
    UNSET_LEAD_PAGE_FILTER,
    SET_LEAD_PAGE_ACTIVE_PAGE,
    SET_LEAD_PAGE_ACTIVE_SORT,

    SET_EDIT_ENTRY_VIEW_LEAD,

    AF_VIEW_SET_ANALYSIS_FRAMEWORK,
    AF_VIEW_ADD_WIDGET,
    AF_VIEW_REMOVE_WIDGET,
    AF_VIEW_UPDATE_WIDGET,
} from '../action-types/siloDomainData';

import {
    SET_USER_PROJECTS,
} from '../action-types/domainData';

import initialSiloDomainData from '../initial-state/siloDomainData';
import update from '../../public/utils/immutable-update';

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
        stale: false,
    },
};

const createLead = ({ id, serverId, type, values = {}, stale = false }) => {
    const settings = {
        data: {
            id: { $set: id },
            type: { $set: type },
        },
        form: {
            values: { $set: values },
        },
        uiState: {
            stale: { $set: stale },
        },
        serverId: { $set: serverId },
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

    // set error flag for uiState
    const ld = newState.addLeadView.leads[index];
    let error = false;
    if (ld.form.errors && ld.form.errors.length > 0) {
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
                            stale: true,
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
    return update(state, settings);
};

const leadViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                filter: { $auto: { $set: {} } },
                activePage: { $set: 1 },
            } },
        },
    };
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

const setLeads = (state, action) => {
    const { leads, totalLeadsCount, projectId } = action;
    const settings = {
        leadPage: {
            [projectId]: { $auto: {
                leads: { $set: leads },
                totalLeadsCount: { $set: totalLeadsCount },
            } },
        },
    };
    return update(state, settings);
};

const editEntryViewSetLead = (state, action) => {
    const settings = {
        editEntryView: {
            lead: {
                $set: action.lead,
            },
        },
    };
    return update(state, settings);
};

const afViewSetAnalysisFramework = (state, { analysisFramework }) => {
    const settings = {
        analysisFrameworkView: {
            analysisFramework: { $auto: {
                $set: analysisFramework,
            } },
        },
    };
    return update(state, settings);
};

const afViewAddWidget = (state, { analysisFrameworkId, widget }) => {
    if (!state.analysisFrameworkView.analysisFramework ||
        !state.analysisFrameworkView.analysisFramework.widgets ||
        state.analysisFrameworkView.analysisFramework.id !== analysisFrameworkId) {
        return state;
    }

    const settings = {
        analysisFrameworkView: {
            analysisFramework: {
                widgets: { $push: widget },
            },
        },
    };
    return update(state, settings);
};

const afViewRemoveWidget = (state, { analysisFrameworkId, widgetKey }) => {
    if (!state.analysisFrameworkView.analysisFramework ||
        !state.analysisFrameworkView.analysisFramework.widgets ||
        state.analysisFrameworkView.analysisFramework.id !== analysisFrameworkId) {
        return state;
    }

    const existingWidgets = state.analysisFrameworkView.analysisFramework.widgets;
    const index = existingWidgets.findIndex(w => w.key === widgetKey);

    if (index !== -1) {
        const settings = {
            analysisFrameworkView: {
                analysisFramework: {
                    widgets: { $splice: [[index, 1]] },
                },
            },
        };
        return update(state, settings);
    }
    return state;
};

const afViewUpdateWidget = (state, { analysisFrameworkId, widget }) => {
    if (!state.analysisFrameworkView.analysisFramework ||
        !state.analysisFrameworkView.analysisFramework.widgets ||
        state.analysisFrameworkView.analysisFramework.id !== analysisFrameworkId) {
        return state;
    }

    const existingWidgets = state.analysisFrameworkView.analysisFramework.widgets;
    const index = existingWidgets.findIndex(w => w.key === widget.key);

    if (index !== -1) {
        const settings = {
            analysisFrameworkView: {
                analysisFramework: {
                    widgets: { $splice: [[index, 1, widget]] },
                },
            },
        };
        return update(state, settings);
    }
    return state;
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
        case UNSET_ADD_LEAD_VIEW_FILTERS:
            return removeLeadViewSetFilters(state, action);
        case ADD_LEAD_VIEW_LEAD_CHANGE:
            return addLeadViewChangeLead(state, action);
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
        case UNSET_LEAD_PAGE_FILTER:
            return leadViewUnsetFilter(state, action);
        case SET_LEAD_PAGE_ACTIVE_PAGE:
            return leadViewSetActivePage(state, action);
        case SET_LEAD_PAGE_ACTIVE_SORT:
            return leadViewSetActiveSort(state, action);
        case SET_LEADS:
            return setLeads(state, action);

        case SET_EDIT_ENTRY_VIEW_LEAD:
            return editEntryViewSetLead(state, action);

        case AF_VIEW_SET_ANALYSIS_FRAMEWORK:
            return afViewSetAnalysisFramework(state, action);
        case AF_VIEW_ADD_WIDGET:
            return afViewAddWidget(state, action);
        case AF_VIEW_REMOVE_WIDGET:
            return afViewRemoveWidget(state, action);
        case AF_VIEW_UPDATE_WIDGET:
            return afViewUpdateWidget(state, action);

        default:
            return state;
    }
};

export default siloDomainDataReducer;
