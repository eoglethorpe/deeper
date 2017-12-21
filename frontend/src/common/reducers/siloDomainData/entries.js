import update from '../../../public/utils/immutable-update';

// TYPE

export const E__SET_ENTRIES = 'domain-data/E__SET_ENTRIES ';

// ACTION-CREATOR

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


// REDUCER MAP

const reducers = {
    [E__SET_ENTRIES]: setEntries,
};
export default reducers;
