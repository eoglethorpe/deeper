import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const L__SET_LEADS = 'siloDomainData/SET_LEADS';
export const L__PATCH_LEAD = 'siloDomainData/PATCH_LEAD';
export const L__REMOVE_LEAD = 'siloDomainData/REMOVE_LEAD';

export const L__SET_FILTER = 'siloDomainData/SET_FILTER';
export const L__UNSET_FILTER = 'siloDomainData/UNSET_FILTER';

export const L__SET_ACTIVE_PAGE = 'siloDomainData/SET_LEAD_PAGE_ACTIVE_PAGE';
export const L__SET_ACTIVE_SORT = 'siloDomainData/SET_LEAD_PAGE_ACTIVE_SORT';
export const L__SET_LEADS_PER_PAGE = 'siloDomainData/SET_LEADS_PER_PAGE';

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

export const setLeadPageActiveSortAction = ({ activeSort }) => ({
    type: L__SET_ACTIVE_SORT,
    activeSort,
});

export const setLeadPageLeadsPerPageAction = ({ leadsPerPage }) => ({
    type: L__SET_LEADS_PER_PAGE,
    leadsPerPage,
});

export const setLeadsAction = ({ leads, totalLeadsCount }) => ({
    type: L__SET_LEADS,
    leads,
    totalLeadsCount,
});

export const patchLeadAction = ({ lead }) => ({
    type: L__PATCH_LEAD,
    lead,
});

export const removeLeadAction = ({ lead }) => ({
    type: L__REMOVE_LEAD,
    lead,
});

// REDUCER

const leadViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                filter: { $set: filters },
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

const leadViewSetLeadsPerPage = (state, action) => {
    const { leadsPerPage } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                leadsPerPage: { $set: leadsPerPage },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const setLeads = (state, action) => {
    const { activeProject } = state;
    const { leads, totalLeadsCount } = action;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                leads: { $set: leads },
                totalLeadsCount: { $set: totalLeadsCount },
            } },
        },
    };
    return update(state, settings);
};

const removeLead = (state, action) => {
    const { activeProject } = state;
    const { lead } = action;
    const settings = {
        leadPage: {
            [activeProject]: {
                leads: { $filter: ld => ld.id !== lead.id },
            },
        },
    };
    return update(state, settings);
};

const patchLead = (state, action) => {
    const { activeProject, leadPage } = state;
    const { lead } = action;

    const leadIndex = leadPage[activeProject].leads.findIndex(ld => ld.id === lead.id);
    const settings = {
        leadPage: {
            [activeProject]: {
                leads: { $splice: [[leadIndex, 1, lead]] },
            },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [L__SET_FILTER]: leadViewSetFilter,
    [L__UNSET_FILTER]: leadViewUnsetFilter,
    [L__SET_ACTIVE_PAGE]: leadViewSetActivePage,
    [L__SET_ACTIVE_SORT]: leadViewSetActiveSort,
    [L__SET_LEADS_PER_PAGE]: leadViewSetLeadsPerPage,

    [L__SET_LEADS]: setLeads,
    [L__PATCH_LEAD]: patchLead,
    [L__REMOVE_LEAD]: removeLead,
};

export default reducers;
