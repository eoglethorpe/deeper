import update from '../../public/utils/immutable-update';
import createReducerWithMap from '../utils/createReducerWithMap';
import initialAuthState from '../initial-state/auth';

// TYPE

export const SET_TOKEN_ACTION = 'auth/SET_TOKEN';
export const SET_PROJECT_LIST_ACTION = 'extension/SET_PROJECT_LIST';
export const SET_LEAD_OPTIONS_ACTION = 'extension/SET_PROJECT_OPTIONS';

// ACTION-CREATOR

export const setTokenAction = ({ token }) => ({
    type: SET_TOKEN_ACTION,
    token,
});

export const setProjectListAction = ({ projects }) => ({
    type: SET_PROJECT_LIST_ACTION,
    projects,
});

export const setLeadOptionsAction = ({ leadOptions }) => ({
    type: SET_LEAD_OPTIONS_ACTION,
    leadOptions,
});


// REDUCER

const setToken = (state, action) => {
    const {
        token,
    } = action;

    const settings = {
        token: {
            $merge: token,
        },
    };

    const newState = update(state, settings);
    return newState;
};

const setProjectList = (state, action) => {
    const {
        projects,
    } = action;

    const settings = {
        projects: {
            $set: projects,
        },
    };

    const newState = update(state, settings);
    return newState;
};

const setLeadOptions = (state, action) => {
    const { leadOptions } = action;

    const settings = {
        leadOptions: {
            $set: leadOptions,
        },
    };

    const newState = update(state, settings);
    return newState;
};

export const authReducers = {
    [SET_TOKEN_ACTION]: setToken,
    [SET_PROJECT_LIST_ACTION]: setProjectList,
    [SET_LEAD_OPTIONS_ACTION]: setLeadOptions,
};

const authReducer = createReducerWithMap(authReducers, initialAuthState);
export default authReducer;
