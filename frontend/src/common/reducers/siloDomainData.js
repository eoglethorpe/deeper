import {
    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,

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

    L__SET_LEADS,
    L__SET_FILTER,
    L__UNSET_FILTER,
    L__SET_ACTIVE_PAGE,
    L__SET_ACTIVE_SORT,

    EE_ADD_ENTRY,
    EE_REMOVE_ENTRY,
    EE_SET_ACTIVE_ENTRY,
    EE_SET_LEAD,
    EE_ENTRY_CHANGE,

    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,

    CE_VIEW_SET_SELECTED_CATEGORY,
    CE_VIEW_SET_SELECTED_SUB_CATEGORY,
    CE_VIEW_SET_SELECTED_SUB_SUB_CATEGORY,
} from '../action-types/siloDomainData';
import {
    LOGOUT_ACTION,
} from '../action-types/auth';
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
        serverId: undefined,
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
            serverId: { $set: serverId },
        },
        form: {
            values: { $set: values },
        },
        uiState: {
            stale: { $set: stale },
        },
    };
    return update(leadReference, settings);
};

const entryReference = {
    data: {
        id: 'entry-0',
        serverId: undefined,
    },
    widget: {
        values: {
            title: 'Entry #0',
        },
    },
    uiState: {
        error: false,
        stale: false,
    },
};

const createEntry = ({ id, serverId, values = {}, stale = false }) => {
    const settings = {
        data: {
            id: { $set: id },
            serverId: { $set: serverId },
        },
        widget: {
            values: { $set: values },
        },
        uiState: {
            stale: { $set: stale },
        },
    };
    return update(entryReference, settings);
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
const logout = () => initialSiloDomainData;

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

    const serverIdMap = leads.reduce(
        (acc, lead) => {
            if (lead.data && lead.data.serverId) {
                acc[lead.data.serverId] = true;
            }
            return acc;
        },
        {},
    );

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
                            stale: true,
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
                widgets: { $push: [widget] },
            },
        },
    };
    return update(state, settings);
};

const afViewRemoveWidget = (state, { analysisFrameworkId, widgetId }) => {
    if (!state.analysisFrameworkView.analysisFramework ||
        !state.analysisFrameworkView.analysisFramework.widgets ||
        state.analysisFrameworkView.analysisFramework.id !== analysisFrameworkId) {
        return state;
    }

    const existingWidgets = state.analysisFrameworkView.analysisFramework.widgets;
    const index = existingWidgets.findIndex(w => w.key === widgetId);

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

const editEntryViewSetLead = (state, action) => {
    const { lead } = action;
    const leadId = lead.id;
    const settings = {
        editEntryView: {
            [leadId]: { $auto: {
                lead: {
                    $set: lead,
                },
            } },
        },
    };
    // TODO: clear all other leads later
    return update(state, settings);
};

const editEntryViewAddEntry = (state, action) => {
    const { entry, leadId } = action;

    const newEntry = createEntry(entry);

    const settings = {
        editEntryView: {
            [leadId]: { $auto: {
                leadId: { $set: leadId },
                selectedEntryId: { $set: newEntry.data.id },
                entries: { $autoArray: {
                    $unshift: [newEntry],
                } },
            } },
        },
    };
    return update(state, settings);
};

const editEntryViewChangeEntry = (state, action) => {
    const {
        leadId,
        entryId,

        data = {},
        values = {},
    } = action;

    const index = state.editEntryView[leadId].entries.findIndex(
        e => e.data.id === entryId,
    );

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [index]: {
                        data: {
                            $merge: data,
                        },
                        widget: {
                            values: { $merge: values },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryViewRemoveEntry = (state, action) => {
    const { entryId, leadId } = action;

    const entries = state.editEntryView[leadId].entries;
    const entryIndex = entries.findIndex(d => d.data.id === entryId);

    let newActiveId;
    if (entryIndex + 1 < entries.length) {
        newActiveId = entries[entryIndex + 1].data.id;
    } else if (entryIndex - 1 >= 0) {
        newActiveId = entries[entryIndex - 1].data.id;
    }

    const settings = {
        editEntryView: {
            [leadId]: {
                selectedEntryId: { $set: newActiveId },
                entries: {
                    $splice: [[entryIndex, 1]],
                },
            },
        },
    };

    return update(state, settings);
};

const editEntryViewSetActiveEntry = (state, action) => {
    const { leadId, entryId } = action;
    const settings = {
        editEntryView: {
            [leadId]: {
                selectedEntryId: { $set: entryId },
            },
        },
    };
    return update(state, settings);
};

const ceViewSelectedCategory = (state, action) => {
    const settings = {
        selectedCategoryView: {
            categoryId: {
                $set: action.selectedCategoryId,
            },
        },
    };
    return update(state, settings);
};

const ceViewSelectedSubCategory = (state, action) => {
    const view = state.selectedCategoryView;
    const selectedCategory = view.categoryId;

    const settings = {
        selectedCategoryView: {
            subCategory: {
                [selectedCategory]: {
                    $set: action.selectedSubCategoryId,
                },
            },
        },
    };
    return update(state, settings);
};

const ceViewSelectedSubSubCategory = (state, action) => {
    const view = state.selectedCategoryView;
    const selectedCategory = view.categoryId;
    const selectedSubCategory = view.subCategory[selectedCategory];

    const settings = {
        selectedCategoryView: {
            subSubCategory: {
                [selectedSubCategory]: {
                    $set: action.selectedSubSubCategoryId,
                },
            },
        },
    };
    return update(state, settings);
};


const reducers = {
    [LOGOUT_ACTION]: logout,

    [SET_USER_PROJECTS]: setUserProjects,
    [SET_ACTIVE_PROJECT]: setActiveProject,
    [SET_ACTIVE_COUNTRY]: setActiveCountry,

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

    [L__SET_FILTER]: leadViewSetFilter,
    [L__UNSET_FILTER]: leadViewUnsetFilter,
    [L__SET_ACTIVE_PAGE]: leadViewSetActivePage,
    [L__SET_ACTIVE_SORT]: leadViewSetActiveSort,
    [L__SET_LEADS]: setLeads,

    [EE_ADD_ENTRY]: editEntryViewAddEntry,
    [EE_REMOVE_ENTRY]: editEntryViewRemoveEntry,
    [EE_SET_ACTIVE_ENTRY]: editEntryViewSetActiveEntry,
    [EE_SET_LEAD]: editEntryViewSetLead,
    [EE_ENTRY_CHANGE]: editEntryViewChangeEntry,

    [AF__SET_ANALYSIS_FRAMEWORK]: afViewSetAnalysisFramework,
    [AF__VIEW_ADD_WIDGET]: afViewAddWidget,
    [AF__REMOVE_WIDGET]: afViewRemoveWidget,
    [AF__VIEW_UPDATE_WIDGET]: afViewUpdateWidget,

    [CE_VIEW_SET_SELECTED_CATEGORY]: ceViewSelectedCategory,
    [CE_VIEW_SET_SELECTED_SUB_CATEGORY]: ceViewSelectedSubCategory,
    [CE_VIEW_SET_SELECTED_SUB_SUB_CATEGORY]: ceViewSelectedSubSubCategory,
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
