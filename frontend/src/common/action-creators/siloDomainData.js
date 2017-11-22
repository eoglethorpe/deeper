import {
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
    SET_LEAD_PAGE_ACTIVE_PAGE,
    SET_LEAD_PAGE_ACTIVE_SORT,
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


export const setLeadPageActivePageAction = ({ activePage }) => ({
    type: SET_LEAD_PAGE_ACTIVE_PAGE,
    activePage,
});

export const setLeadPageActiveSortAction = ({ activeSort }) => ({
    type: SET_LEAD_PAGE_ACTIVE_SORT,
    activeSort,
});
