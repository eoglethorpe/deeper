import update from '../../../public/utils/immutable-update';
import {
    E__SET_ENTRIES,
} from '../../action-types/siloDomainData';

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
