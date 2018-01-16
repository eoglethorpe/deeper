import update from '../../../public/utils/immutable-update';

// TYPE

export const SET_ENTRY_FILTER_OPTIONS = 'domain-data/SET_ENTRY_FILTER_OPTIONS';

// ACTION-CREATOR

export const setEntryFilterOptionsAction = ({ projectId, entryFilterOptions }) => ({
    type: SET_ENTRY_FILTER_OPTIONS,
    projectId,
    entryFilterOptions,
});

// REDUCER

const setEntryFilterOptions = (state, action) => {
    const { projectId, entryFilterOptions } = action;
    const settings = {
        entryFilterOptions: {
            [projectId]: { $autoArray: {
                $set: entryFilterOptions,
            } },
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_ENTRY_FILTER_OPTIONS]: setEntryFilterOptions,
};
export default reducers;
