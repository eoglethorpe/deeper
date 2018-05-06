import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../../utils/createReducerWithMap';
import initialAppState from '../initial-state/app';
import { LOGOUT_ACTION } from '../reducers/auth';

// TYPE

export const SET_WAITING_FOR_PROJECT_ACTION = 'app/SET_WAITING_FOR_PROJECT';
export const SET_WAITING_FOR_PREFERENCES_ACTION = 'app/SET_WAITING_FOR_PREFERENCES';

// ACTION-CREATOR

export const setWaitingForProjectAction = value => ({
    type: SET_WAITING_FOR_PROJECT_ACTION,
    value,
});

export const setWaitingForPreferencesAction = value => ({
    type: SET_WAITING_FOR_PREFERENCES_ACTION,
    value,
});

// REDUCER

const logout = () => initialAppState;

const setWaitingForProject = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForProject: { $set: value },
    };
    return update(state, settings);
};

const setWaitingForPreferences = (state, action) => {
    const { value } = action;
    const settings = {
        waitingForPreferences: { $set: value },
    };
    return update(state, settings);
};

export const appReducers = {
    [SET_WAITING_FOR_PROJECT_ACTION]: setWaitingForProject,
    [SET_WAITING_FOR_PREFERENCES_ACTION]: setWaitingForPreferences,
    [LOGOUT_ACTION]: logout,
};

const appReducer = createReducerWithMap(appReducers, initialAppState);
export default appReducer;
