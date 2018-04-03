import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const E__SET_ENTRIES = 'siloDomainData/E__SET_ENTRIES';
export const E__SET_FILTER = 'siloDomainData/E__SET_FILTER';
export const E__UNSET_FILTER = 'siloDomainData/E__UNSET_FILTER';
export const E__SET_ACTIVE_PAGE = 'siloDomainData/E__SET_ACTIVE_PAGE';

// ACTION-CREATOR

export const setEntriesViewFilterAction = ({ filters }) => ({
    type: E__SET_FILTER,
    filters,
});

export const unsetEntriesViewFilterAction = () => ({
    type: E__UNSET_FILTER,
});

export const setEntriesViewActivePageAction = ({ activePage }) => ({
    type: E__SET_ACTIVE_PAGE,
    activePage,
});

export const setEntriesAction = ({ projectId, entries, totalEntriesCount }) => ({
    type: E__SET_ENTRIES,
    projectId,
    entries,
    totalEntriesCount,
});

// REDUCER

const setEntries = (state, action) => {
    const {
        entries,
        projectId,
        totalEntriesCount,
    } = action;

    const settings = {
        entriesView: {
            [projectId]: { $auto: {
                entries: { $set: entries },
                totalEntriesCount: { $set: totalEntriesCount },
            } },
        },
    };
    return update(state, settings);
};

const entryViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: { $auto: {
            [activeProject]: { $auto: {
                filter: { $auto: { $merge: filters } },
                activePage: { $set: 1 },
            } },
        } },
    };
    return update(state, settings);
};

const entryViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                filter: { $set: {} },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const entriesViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const settings = {
        entriesView: {
            [activeProject]: { $auto: {
                activePage: { $set: activePage },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [E__SET_FILTER]: entryViewSetFilter,
    [E__UNSET_FILTER]: entryViewUnsetFilter,
    [E__SET_ENTRIES]: setEntries,
    [E__SET_ACTIVE_PAGE]: entriesViewSetActivePage,
};
export default reducers;
