import {
    SET_ACTIVE_PROJECT,
    SET_ACTIVE_COUNTRY,

    LA__SET_FILTERS,
    LA__UNSET_FILTERS,
    LA__SET_ACTIVE_LEAD_ID,
    LA__ADD_LEADS,
    LA__LEAD_CHANGE,
    LA__LEAD_SAVE,
    LA__LEAD_REMOVE,
    LA__LEAD_NEXT,
    LA__LEAD_PREV,
    LA__COPY_ALL_BELOW,
    LA__COPY_ALL,

    L__SET_LEADS,
    L__SET_FILTER,
    L__UNSET_FILTER,
    L__SET_ACTIVE_PAGE,
    L__SET_ACTIVE_SORT,

    E__SET_ENTRIES,

    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,

    EE__SET_LEAD,
    EE__ADD_ENTRY,
    EE__REMOVE_ENTRY,
    EE__SET_ACTIVE_ENTRY,
    EE__ENTRY_SAVE,
    EE__ENTRY_CHANGE,
    EE__ENTRY_DIFF,
    EE__ENTRY_MARK_FOR_DELETE,

    CE_VIEW_ADD_NEW_CATEGORY,
    CE_VIEW_SET_ACTIVE_CATEGORY_ID,
    CE_VIEW_ADD_NEW_SUBCATEGORY,
    CE_VIEW_UPDATE_SELECTED_SUBCATEGORIES,
} from '../action-types/siloDomainData';


// GLOBAL

export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const setActiveCountryAction = ({ activeCountry }) => ({
    type: SET_ACTIVE_COUNTRY,
    activeCountry,
});

// LEAD ADD

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

export const addLeadViewLeadChangeAction = ({
    leadId, values, formErrors, formFieldErrors, upload, uiState,
}) => ({
    type: LA__LEAD_CHANGE,
    leadId,
    values,
    formErrors,
    formFieldErrors,
    upload,
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

// LEADS

export const setLeadPageFilterAction = ({ filters }) => ({
    type: L__SET_FILTER,
    filters,
});

export const unsetLeadPageFilterAction = () => ({
    type: L__UNSET_FILTER,
});

export const setLeadPageActivePageAction = ({ activePage }) => ({
    type: L__SET_ACTIVE_PAGE,
    activePage,
});

export const setLeadPageActiveSortAction = ({ activeSort }) => ({
    type: L__SET_ACTIVE_SORT,
    activeSort,
});

export const setLeadsAction = ({ projectId, leads, totalLeadsCount }) => ({
    type: L__SET_LEADS,
    projectId,
    leads,
    totalLeadsCount,
});

// ENTRIES

export const setEntriesAction = ({ projectId, entries, totalEntriesCount }) => ({
    type: E__SET_ENTRIES,
    projectId,
    entries,
    totalEntriesCount,
});

// EDIT ENTRIES

export const setEditEntryViewLeadAction = ({ lead }) => ({
    type: EE__SET_LEAD,
    lead,
});

export const addEntryAction = ({ leadId, entry }) => ({
    type: EE__ADD_ENTRY,
    leadId,
    entry,
});

export const removeEntryAction = ({ leadId, entryId }) => ({
    type: EE__REMOVE_ENTRY,
    leadId,
    entryId,
});

export const saveEntryAction = ({ leadId, entryId, data, values }) => ({
    type: EE__ENTRY_SAVE,
    leadId,
    entryId,
    data,
    values,
});

export const changeEntryAction = ({ leadId, entryId, data, values, uiState }) => ({
    type: EE__ENTRY_CHANGE,
    leadId,
    entryId,
    data,
    values,
    uiState,
});

export const diffEntriesAction = ({ leadId, diffs }) => ({
    type: EE__ENTRY_DIFF,
    leadId,
    diffs,
});

export const markForDeleteEntryAction = ({ leadId, entryId, mark }) => ({
    type: EE__ENTRY_MARK_FOR_DELETE,
    leadId,
    entryId,
    mark,
});

export const setActiveEntryAction = ({ leadId, entryId }) => ({
    type: EE__SET_ACTIVE_ENTRY,
    leadId,
    entryId,
});

// ANALYSIS FRAMEWORK

export const setAfViewAnalysisFrameworkAction = ({ analysisFramework }) => ({
    type: AF__SET_ANALYSIS_FRAMEWORK,
    analysisFramework,
});

export const addAfViewWidgetAction = ({ analysisFrameworkId, widget }) => ({
    type: AF__VIEW_ADD_WIDGET,
    analysisFrameworkId,
    widget,
});

export const removeAfViewWidgetAction = ({ analysisFrameworkId, widgetId }) => ({
    type: AF__REMOVE_WIDGET,
    analysisFrameworkId,
    widgetId,
});

export const updateAfViewWidgetAction = ({ analysisFrameworkId, widget }) => ({
    type: AF__VIEW_UPDATE_WIDGET,
    analysisFrameworkId,
    widget,
});

// Category Editor
export const addNewCategoryAction = ({ id, title }) => ({
    type: CE_VIEW_ADD_NEW_CATEGORY,
    id,
    title,
});

export const setActiveCategoryIdAction = id => ({
    type: CE_VIEW_SET_ACTIVE_CATEGORY_ID,
    id,
});

export const addNewSubcategoryAction = ({ level, newSubcategory }) => ({
    type: CE_VIEW_ADD_NEW_SUBCATEGORY,
    level,
    newSubcategory,
});

export const updateSelectedSubcategoriesAction = ({ level, subCategoryId }) => ({
    type: CE_VIEW_UPDATE_SELECTED_SUBCATEGORIES,
    level,
    subCategoryId,
});
