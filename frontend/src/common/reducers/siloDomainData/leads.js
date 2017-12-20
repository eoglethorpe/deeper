import update from '../../../public/utils/immutable-update';

// TYPE

export const L__SET_FILTER = 'silo-domain-data/L__SET_FILTER';
export const L__UNSET_FILTER = 'silo-domain-data/L__UNSET_FILTER';
export const L__SET_ACTIVE_PAGE = 'silo-domain-data/SET_LEAD_PAGE_ACTIVE_PAGE';
export const L__SET_VIEW_MODE = 'silo-domain-data/L__SET_VIEW_MODE';
export const L__SET_ACTIVE_SORT = 'silo-domain-data/SET_LEAD_PAGE_ACTIVE_SORT';
export const L__SET_LEADS = 'domain-data/L__SET_LEADS';

// ACTION-CREATOR

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

export const setLeadPageViewModeAction = ({ viewMode }) => ({
    type: L__SET_VIEW_MODE,
    viewMode,
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

// REDUCER

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
                filter: { $set: {} },
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

const leadViewSetViewMode = (state, action) => {
    const { viewMode } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                viewMode: { $set: viewMode },
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

// REDUCER MAP

const reducers = {
    [L__SET_FILTER]: leadViewSetFilter,
    [L__UNSET_FILTER]: leadViewUnsetFilter,
    [L__SET_ACTIVE_PAGE]: leadViewSetActivePage,
    [L__SET_VIEW_MODE]: leadViewSetViewMode,
    [L__SET_ACTIVE_SORT]: leadViewSetActiveSort,
    [L__SET_LEADS]: setLeads,
};
export default reducers;
