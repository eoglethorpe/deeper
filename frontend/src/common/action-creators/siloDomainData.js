import {
    L__SET_LEADS,

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

    L__SET_FILTER,
    L__UNSET_FILTER,
    L__SET_ACTIVE_PAGE,
    L__SET_ACTIVE_SORT,

    EE_SET_LEAD,

    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,

    EE_ADD_ENTRY,
    EE_REMOVE_ENTRY,
    EE_SET_ACTIVE_ENTRY,
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

// EDIT ENTRIES

export const setEditEntryViewLeadAction = ({ lead }) => ({
    type: EE_SET_LEAD,
    lead,
});

export const addEntryAction = ({ leadId, entry }) => ({
    type: EE_ADD_ENTRY,
    leadId,
    entry,
});

export const removeEntryAction = ({ leadId, entryId }) => ({
    type: EE_REMOVE_ENTRY,
    leadId,
    entryId,
});

export const setActiveEntryAction = ({ leadId, entryId }) => ({
    type: EE_SET_ACTIVE_ENTRY,
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
