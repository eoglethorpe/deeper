import {
    SET_LEADS,

    SET_ACTIVE_PROJECT,
    SET_ACTIVE_COUNTRY,

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
    UNSET_LEAD_PAGE_FILTER,
    SET_LEAD_PAGE_ACTIVE_PAGE,
    SET_LEAD_PAGE_ACTIVE_SORT,

    SET_EDIT_ENTRY_VIEW_LEAD,

    AF_VIEW_SET_ANALYSIS_FRAMEWORK,
    AF_VIEW_ADD_WIDGET,
    AF_VIEW_REMOVE_WIDGET,
    AF_VIEW_UPDATE_WIDGET,
} from '../action-types/siloDomainData';


export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const setActiveCountryAction = ({ activeCountry }) => ({
    type: SET_ACTIVE_COUNTRY,
    activeCountry,
});

export const setAddLeadViewFiltersAction = filters => ({
    type: SET_ADD_LEAD_VIEW_FILTERS,
    filters,
});

export const setAddLeadViewActiveLeadIdAction = leadId => ({
    type: SET_ADD_LEAD_VIEW_ACTIVE_LEAD_ID,
    leadId,
});

export const addAddLeadViewLeadsAction = leads => ({
    type: ADD_ADD_LEAD_VIEW_LEADS,
    leads,
});

export const addLeadViewLeadChangeAction = ({
    leadId, values, formErrors, formFieldErrors, upload, uiState,
}) => ({
    type: ADD_LEAD_VIEW_LEAD_CHANGE,
    leadId,
    values,
    formErrors,
    formFieldErrors,
    upload,
    uiState,
});

export const addLeadViewLeadSetPendingAction = ({ leadId, pending }) => ({
    type: ADD_LEAD_VIEW_LEAD_SET_PENDING,
    leadId,
    pending,
});

export const addLeadViewLeadSaveAction = ({ leadId, serverId }) => ({
    type: ADD_LEAD_VIEW_LEAD_SAVE,
    leadId,
    serverId,
});

export const addLeadViewLeadRemoveAction = leadId => ({
    type: ADD_LEAD_VIEW_LEAD_REMOVE,
    leadId,
});

export const addLeadViewLeadNextAction = () => ({
    type: ADD_LEAD_VIEW_LEAD_NEXT,
});

export const addLeadViewLeadPrevAction = () => ({
    type: ADD_LEAD_VIEW_LEAD_PREV,
});

export const setLeadPageFilterAction = ({ filters }) => ({
    type: SET_LEAD_PAGE_FILTER,
    filters,
});

export const unsetLeadPageFilterAction = () => ({
    type: UNSET_LEAD_PAGE_FILTER,
});

export const setLeadPageActivePageAction = ({ activePage }) => ({
    type: SET_LEAD_PAGE_ACTIVE_PAGE,
    activePage,
});

export const setLeadPageActiveSortAction = ({ activeSort }) => ({
    type: SET_LEAD_PAGE_ACTIVE_SORT,
    activeSort,
});

export const setLeadsAction = ({ projectId, leads, totalLeadsCount }) => ({
    type: SET_LEADS,
    projectId,
    leads,
    totalLeadsCount,
});

export const setEditEntryViewLeadAction = ({ lead }) => ({
    type: SET_EDIT_ENTRY_VIEW_LEAD,
    lead,
});

export const setAfViewAnalysisFrameworkAction = ({ analysisFramework }) => ({
    type: AF_VIEW_SET_ANALYSIS_FRAMEWORK,
    analysisFramework,
});

export const addAfViewWidgetAction = ({ analysisFrameworkId, widget }) => ({
    type: AF_VIEW_ADD_WIDGET,
    analysisFrameworkId,
    widget,
});

export const removeAfViewWidgetAction = ({ analysisFrameworkId, widgetId }) => ({
    type: AF_VIEW_REMOVE_WIDGET,
    analysisFrameworkId,
    widgetId,
});

export const updateAfViewWidgetAction = ({ analysisFrameworkId, widget }) => ({
    type: AF_VIEW_UPDATE_WIDGET,
    analysisFrameworkId,
    widget,
});
