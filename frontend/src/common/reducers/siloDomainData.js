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

    E__SET_ENTRIES,

    EE__ADD_ENTRY,
    EE__REMOVE_ENTRY,
    EE__SET_ACTIVE_ENTRY,
    EE__SET_LEAD,
    EE__ENTRY_SAVE,
    EE__ENTRY_CHANGE,
    EE__ENTRY_DIFF,
    EE__ENTRY_MARK_FOR_DELETE,

    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,

    CE_VIEW_ADD_NEW_CATEGORY,
    CE_VIEW_SET_ACTIVE_CATEGORY_ID,
    CE_VIEW_ADD_NEW_SUBCATEGORY,
    CE_VIEW_UPDATE_SELECTED_SUBCATEGORIES,
} from '../action-types/siloDomainData';
import {
    LOGOUT_ACTION,
} from '../action-types/auth';
import {
    SET_USER_PROJECTS,
} from '../action-types/domainData';
import {
    createEntry,
    calcNewEntries,
} from '../entities/entry';

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
        pristine: false,
    },
};

const createLead = ({ id, serverId, type, values = {}, pristine = false }) => {
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
            pristine: { $set: pristine },
        },
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

const setEntries = (state, action) => {
    const { entries, totalEntriesCount, projectId } = action;
    const settings = {
        entriesView: {
            [projectId]: { $auto: {
                entries: { $set: entries },
                totalEntiresCount: { $set: totalEntriesCount },
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

const editEntryViewSaveEntry = (state, action) => {
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
                        uiState: {
                            pristine: { $set: true },
                            error: { $set: false },
                        },
                    },
                },
            },
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
        uiState = {},
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
                        uiState: {
                            $merge: uiState,
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};


const editEntryViewDiffEntries = (state, action) => {
    const {
        leadId,
        diffs,
    } = action;

    const localEntries = state.editEntryView[leadId].entries;
    const newEntries = calcNewEntries(localEntries, diffs);

    // If last selected was deleted in newEntries, then set the first item as
    // selected
    let newActiveId = state.editEntryView[leadId].selectedEntryId;
    const oldSelected = newEntries.find(entry => entry.data.id === newActiveId);
    if (!oldSelected && newEntries.length > 0) {
        newActiveId = newEntries[0].data.id;
    }

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: { $set: newEntries },
                selectedEntryId: { $set: newActiveId },
            },
        },
    };

    return update(state, settings);
};

const entryMarkForDelete = (state, action) => {
    const {
        leadId,
        entryId,
        mark,
    } = action;

    const index = state.editEntryView[leadId].entries.findIndex(
        e => e.data.id === entryId,
    );

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [index]: {
                        markedForDelete: { $set: mark },
                        uiState: {
                            pristine: { $set: false },
                            error: { $set: false },
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

const ceViewAddNewCategory = (state, action) => {
    const settings = {
        categoryEditorView: {
            categories: {
                $push: [{
                    id: action.id,
                    title: action.title,
                    selectedSubcategories: [],
                    subcategories: [],
                }],
            },
            activeCategoryId: {
                $set: action.id,
            },
        },
    };

    return update(state, settings);
};

const ceViewSetActiveCategoryId = (state, action) => {
    const settings = {
        categoryEditorView: {
            activeCategoryId: {
                $set: action.id,
            },
        },
    };

    return update(state, settings);
};

// TODO: maybe move to utils
const buildSettings = (indices, action, value, wrapper) => (
    indices.reverse().reduce(
        (acc, selected, index) => wrapper({ [selected]: acc }, indices.length - index - 1),
        wrapper({ [action]: value }, indices.length),
    )
);

const getIndicesFromSelectedCategories = (categories, activeCategoryId, stopLevel) => {
    const activeCategoryIndex = categories.findIndex(d => d.id === activeCategoryId);

    const {
        selectedSubcategories,
        subcategories: firstSubcategories,
    } = categories[activeCategoryIndex];

    const { indices: newIndices } = selectedSubcategories.reduce(
        ({ subcategories, indices }, selected) => {
            const index = subcategories.findIndex(d => d.id === selected);
            return {
                subcategories: subcategories[index].subcategories,
                indices: indices.concat([index]),
            };
        },
        { subcategories: firstSubcategories, indices: [activeCategoryIndex] },
    );

    if (stopLevel >= 0) {
        newIndices.splice(stopLevel + 1);
    }

    return newIndices;
};

const subcategoryWrapper = (val, i) => (i <= 0 ? val : ({ subcategories: val }));

const ceViewAddNewSubcategory = (state, action) => {
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const settingAction = '$push';
    const indices = getIndicesFromSelectedCategories(
        categories,
        activeCategoryId,
        action.level,
    );

    const settings = {
        categoryEditorView: {
            categories: {
                ...buildSettings(
                    indices,
                    settingAction,
                    [action.newSubcategory],
                    subcategoryWrapper,
                ),
            },
        },
    };

    return update(state, settings);
};

const ceViewUpdateSelectedSubcategories = (state, action) => {
    const { categoryEditorView } = state;
    const {
        categories,
        activeCategoryId,
    } = categoryEditorView;

    const categoryIndex = categories.findIndex(d => d.id === activeCategoryId);

    const settings = {
        categoryEditorView: {
            categories: {
                [categoryIndex]: {
                    selectedSubcategories: {
                        $splice: [[action.level, length, action.subCategoryId]],
                    },
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

    [E__SET_ENTRIES]: setEntries,

    [EE__ADD_ENTRY]: editEntryViewAddEntry,
    [EE__REMOVE_ENTRY]: editEntryViewRemoveEntry,
    [EE__SET_ACTIVE_ENTRY]: editEntryViewSetActiveEntry,
    [EE__SET_LEAD]: editEntryViewSetLead,
    [EE__ENTRY_SAVE]: editEntryViewSaveEntry,
    [EE__ENTRY_CHANGE]: editEntryViewChangeEntry,
    [EE__ENTRY_DIFF]: editEntryViewDiffEntries,
    [EE__ENTRY_MARK_FOR_DELETE]: entryMarkForDelete,

    [AF__SET_ANALYSIS_FRAMEWORK]: afViewSetAnalysisFramework,
    [AF__VIEW_ADD_WIDGET]: afViewAddWidget,
    [AF__REMOVE_WIDGET]: afViewRemoveWidget,
    [AF__VIEW_UPDATE_WIDGET]: afViewUpdateWidget,

    [CE_VIEW_ADD_NEW_CATEGORY]: ceViewAddNewCategory,
    [CE_VIEW_SET_ACTIVE_CATEGORY_ID]: ceViewSetActiveCategoryId,
    [CE_VIEW_ADD_NEW_SUBCATEGORY]: ceViewAddNewSubcategory,
    [CE_VIEW_UPDATE_SELECTED_SUBCATEGORIES]: ceViewUpdateSelectedSubcategories,
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
