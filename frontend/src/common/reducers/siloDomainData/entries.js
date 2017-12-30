import update from '../../../public/utils/immutable-update';

// TYPE

export const E__SET_ENTRIES = 'domain-data/E__SET_ENTRIES ';
export const E__SET_FILTER = 'silo-domain-data/E__SET_FILTER';
export const E__UNSET_FILTER = 'silo-domain-data/E__UNSET_FILTER';

// ACTION-CREATOR

export const setEntriesViewFilterAction = ({ filters }) => ({
    type: E__SET_FILTER,
    filters,
});

export const unsetEntriesViewFilterAction = () => ({
    type: E__UNSET_FILTER,
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

// REDUCER MAP

const reducers = {
    [E__SET_FILTER]: entryViewSetFilter,
    [E__UNSET_FILTER]: entryViewUnsetFilter,
    [E__SET_ENTRIES]: setEntries,
};
export default reducers;
