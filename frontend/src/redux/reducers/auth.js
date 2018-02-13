import jwtDecode from 'jwt-decode';

import update from '../../vendor/react-store/utils/immutable-update';

import createReducerWithMap from '../../utils/createReducerWithMap';
import schema from '../../schema';
import initialAuthState from '../initial-state/auth';


// TYPE

export const LOGIN_ACTION = 'auth/LOGIN';
export const LOGOUT_ACTION = 'auth/LOGOUT';
export const AUTHENTICATE_ACTION = 'auth/AUTHENTICATE_ACTION';
export const SET_ACCESS_TOKEN_ACTION = 'auth/SET_ACCESS_TOKEN';

// ACTION-CREATOR

export const loginAction = ({ access, refresh }) => ({
    type: LOGIN_ACTION,
    access,
    refresh,
});

export const authenticateAction = () => ({
    type: AUTHENTICATE_ACTION,
});

export const logoutAction = () => ({
    type: LOGOUT_ACTION,
});

export const setAccessTokenAction = access => ({
    type: SET_ACCESS_TOKEN_ACTION,
    access,
});

// HELPER

const decodeAccessToken = (access) => {
    const decodedToken = jwtDecode(access);
    try {
        schema.validate(decodedToken, 'accessToken');
        return {
            userId: decodedToken.userId,
            username: decodedToken.username,
            displayName: decodedToken.displayName,
            isSuperuser: decodedToken.isSuperuser,
            exp: decodedToken.exp,
        };
    } catch (ex) {
        console.warn(ex);
        return {};
    }
};

// REDUCER

const login = (state, action) => {
    const { access, refresh } = action;
    const decodedToken = decodeAccessToken(access);
    const settings = {
        token: { $set: {
            access,
            refresh,
        } },
        activeUser: { $set: decodedToken },
    };
    return update(state, settings);
};

const authenticate = (state) => {
    const settings = {
        authenticated: { $set: true },
    };
    return update(state, settings);
};

const logout = () => initialAuthState;

const setAccessToken = (state, action) => {
    const { access } = action;
    const decodedToken = decodeAccessToken(access);
    const settings = {
        token: { $merge: {
            access,
        } },
        activeUser: { $set: decodedToken },
    };
    return update(state, settings);
};

export const authReducers = {
    [LOGIN_ACTION]: login,
    [AUTHENTICATE_ACTION]: authenticate,
    [LOGOUT_ACTION]: logout,
    [SET_ACCESS_TOKEN_ACTION]: setAccessToken,
};

const authReducer = createReducerWithMap(authReducers, initialAuthState);
export default authReducer;
