import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SET_LEAD_FILTER_OPTIONS = 'domainData/SET_LEAD_FILTER_OPTIONS';
export const ADD_LEAD_GROUP = 'domainData/ADD_LEAD_GROUP';

// ACTION-CREATOR

export const setLeadFilterOptionsAction = ({ projectId, leadFilterOptions }) => ({
    type: SET_LEAD_FILTER_OPTIONS,
    projectId,
    leadFilterOptions,
});

export const addLeadGroupOfProjectAction = ({ projectId, newLeadGroup }) => ({
    type: ADD_LEAD_GROUP,
    projectId,
    newLeadGroup,
});

// REDUCER

const setLeadFilterOptions = (state, action) => {
    const { projectId, leadFilterOptions } = action;
    const settings = {
        leadFilterOptions: {
            [projectId]: { $auto: {
                $set: leadFilterOptions,
            } },
        },
    };
    return update(state, settings);
};

const addLeadGroupOfProject = (state, action) => {
    const { projectId, newLeadGroup } = action;
    const settings = {
        leadFilterOptions: {
            [projectId]: { $auto: {
                leadGroup: { $autoArray: {
                    $push: [newLeadGroup],
                } },
            } },
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_LEAD_FILTER_OPTIONS]: setLeadFilterOptions,
    [ADD_LEAD_GROUP]: addLeadGroupOfProject,
};
export default reducers;
