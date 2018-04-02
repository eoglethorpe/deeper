import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../../utils/createReducerWithMap';
import initialAppState from '../initial-state/app';

// TYPE

export const SET_WAITING_FOR_PROJECT_ACTION = 'app/SET_WAITING_FOR_PROJECT';

// ACTION-CREATOR

export const setWaitingForProjectAction = value => ({
    type: SET_WAITING_FOR_PROJECT_ACTION,
    value,
});

// REDUCER

const setWaitingForProject = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForProject: { $set: value },
    };
    return update(state, settings);
};

export const appReducers = {
    [SET_WAITING_FOR_PROJECT_ACTION]: setWaitingForProject,
};

const appReducer = createReducerWithMap(appReducers, initialAppState);
export default appReducer;
