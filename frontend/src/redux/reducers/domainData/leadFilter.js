import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SET_LEAD_FILTER_OPTIONS = 'domain-data/SET_LEAD_FILTER_OPTIONS';

// ACTION-CREATOR

export const setLeadFilterOptionsAction = ({ projectId, leadFilterOptions }) => ({
    type: SET_LEAD_FILTER_OPTIONS,
    projectId,
    leadFilterOptions,
});

// REDUCER

const setLeadFilterOptions = (state, action) => {
    const { projectId, leadFilterOptions } = action;
    const settings = {
        leadFilterOptions: {
            [projectId]: { $autoArray: {
                $set: leadFilterOptions,
            } },
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_LEAD_FILTER_OPTIONS]: setLeadFilterOptions,
};
export default reducers;
