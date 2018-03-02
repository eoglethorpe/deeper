import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const ARY__SET_ARYS = 'silo-domain-data/ARY__SET_ARYS';
export const ARY__SET_FILTER = 'silo-domain-data/ARY__SET_FILTER';
export const ARY__UNSET_FILTER = 'silo-domain-data/ARY__UNSET_FILTER';
export const ARY__SET_ACTIVE_PAGE = 'silo-domain-data/ARY__SET_ACTIVE_PAGE';
export const ARY__SET_ACTIVE_SORT = 'silo-domain-data/ARY__SET_ACTIVE_SORT';

export const ARY__UPDATE = 'silo-domain-data/ARY__UPDATE';

// ACTION-CREATOR

export const setAryPageFilterAction = ({ filters }) => ({
    type: ARY__SET_FILTER,
    filters,
});

export const unsetAryPageFilterAction = () => ({
    type: ARY__UNSET_FILTER,
});

export const setAryPageActivePageAction = ({ activePage }) => ({
    type: ARY__SET_ACTIVE_PAGE,
    activePage,
});

export const setAryPageActiveSortAction = ({ activeSort }) => ({
    type: ARY__SET_ACTIVE_SORT,
    activeSort,
});

export const setArysAction = ({ projectId, arys, totalArysCount }) => ({
    type: ARY__SET_ARYS,
    projectId,
    arys,
    totalArysCount,
});

export const setAryAction = ({ id, metaData, methodologyData }) => ({
    type: ARY__UPDATE,
    id,
    metaData,
    methodologyData,
});

// HELPERS

// REDUCER

const setArys = (state, action) => {
    const { arys, totalArysCount, projectId } = action;
    const settings = {
        aryPage: {
            [projectId]: { $auto: {
                arys: { $set: arys },
                totalArysCount: { $set: totalArysCount },
            } },
        },
    };
    return update(state, settings);
};

const aryViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        aryPage: {
            [activeProject]: { $auto: {
                filter: { $auto: { $merge: filters } },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const aryViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        aryPage: {
            [activeProject]: { $auto: {
                filter: { $set: {} },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const aryViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const settings = {
        aryPage: {
            [activeProject]: { $auto: {
                activePage: { $set: activePage },
            } },
        },
    };
    return update(state, settings);
};

const aryViewSetActiveSort = (state, action) => {
    const { activeSort } = action;
    const { activeProject } = state;
    const settings = {
        aryPage: {
            [activeProject]: { $auto: {
                activeSort: { $set: activeSort },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const setAry = (state, action) => {
    const {
        id,
        metaData = {},
        methodologyData = {},
    } = action;
    const settings = {
        aryView: {
            [id]: { $auto: {
                metaData: { $auto: {
                    $merge: metaData,
                } },
                methodologyData: { $auto: {
                    $merge: methodologyData,
                } },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [ARY__SET_ARYS]: setArys,
    [ARY__SET_FILTER]: aryViewSetFilter,
    [ARY__UNSET_FILTER]: aryViewUnsetFilter,
    [ARY__SET_ACTIVE_PAGE]: aryViewSetActivePage,
    [ARY__SET_ACTIVE_SORT]: aryViewSetActiveSort,

    [ARY__UPDATE]: setAry,
};

export default reducers;
