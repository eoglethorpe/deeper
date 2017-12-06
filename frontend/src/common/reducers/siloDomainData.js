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
    ADD_LEAD_VIEW_COPY_ALL,
    ADD_LEAD_VIEW_COPY_ALL_BELOW,

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
import { getNumbers } from '../../public/utils/common';
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

// CALCUALTE ERROR
const setErrorForLeads = (state, leadIndices) => {
    const newLeadIndices = !leadIndices
        ? getNumbers(0, state.addLeadView.leads.length)
        : leadIndices;

    const hasError = (newState, leadIndex) => {
        const ld = newState.addLeadView.leads[leadIndex];
        if (ld.form.errors && ld.form.errors.length > 0) {
            return true;
        }
        const errorList = ld.form.fieldErrors;
        return Object.keys(errorList).some(key => !!errorList[key]);
    };

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

    const settings = {
        addLeadView: {
            leads: leadSettings,
        },
    };
    return update(state, settings);
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

const addLeadViewCopyAll = (state, action, behavior) => {
    const {
        leadId,
        attrName,
    } = action;

    const index = state.addLeadView.leads.findIndex(
        lead => lead.data.id === leadId,
    );
    const start = behavior === 'below' ? (index + 1) : 0;

    const valueToCopy = state.addLeadView.leads[index].form.values[attrName];
    const leadSettings = {};
    for (let i = start; i < state.addLeadView.leads.length; i += 1) {
        leadSettings[i] = {
            form: {
                values: { [attrName]: { $set: valueToCopy } },
                fieldErrors: { [attrName]: { $set: undefined } },
            },
            uiState: { stale: { $set: false } },
        };
    }

    // put stale (remove error for that as well)

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

const reducers = {
    [SET_USER_PROJECTS]: setUserProjects,
    [SET_ACTIVE_PROJECT]: setActiveProject,
    [SET_ACTIVE_COUNTRY]: setActiveCountry,
    [ADD_ADD_LEAD_VIEW_LEADS]: addLeadViewAddNewLeads,
    [SET_ADD_LEAD_VIEW_FILTERS]: addLeadViewSetFilters,
    [UNSET_ADD_LEAD_VIEW_FILTERS]: removeLeadViewSetFilters,
    [ADD_LEAD_VIEW_LEAD_CHANGE]: addLeadViewChangeLead,
    [ADD_LEAD_VIEW_LEAD_SAVE]: addLeadViewSaveLead,
    [ADD_LEAD_VIEW_LEAD_REMOVE]: addLeadViewRemoveLead,
    [ADD_LEAD_VIEW_LEAD_PREV]: addLeadViewPrevLead,
    [ADD_LEAD_VIEW_LEAD_NEXT]: addLeadViewNextLead,
    [SET_ADD_LEAD_VIEW_ACTIVE_LEAD_ID]: addLeadViewSetActiveLead,
    [ADD_LEAD_VIEW_COPY_ALL]: addLeadViewCopyAll,
    [ADD_LEAD_VIEW_COPY_ALL_BELOW]: (state, action) => addLeadViewCopyAll(state, action, 'below'),

    [SET_LEAD_PAGE_FILTER]: leadViewSetFilter,
    [UNSET_LEAD_PAGE_FILTER]: leadViewUnsetFilter,
    [SET_LEAD_PAGE_ACTIVE_PAGE]: leadViewSetActivePage,
    [SET_LEAD_PAGE_ACTIVE_SORT]: leadViewSetActiveSort,
    [SET_LEADS]: setLeads,

    [SET_EDIT_ENTRY_VIEW_LEAD]: editEntryViewSetLead,

    [AF_VIEW_SET_ANALYSIS_FRAMEWORK]: afViewSetAnalysisFramework,
    [AF_VIEW_ADD_WIDGET]: afViewAddWidget,
    [AF_VIEW_REMOVE_WIDGET]: afViewRemoveWidget,
    [AF_VIEW_UPDATE_WIDGET]: afViewUpdateWidget,
};

const siloDomainDataReducer = (state = initialSiloDomainData, action) => {
    const { type } = action;
    const reducer = reducers[type];
    if (!reducer) {
        return state;
    }
    return reducer(state, action);
};

export default siloDomainDataReducer;
