import jwtDecode from 'jwt-decode';

import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
    AUTHENTICATE_ACTION,
    SET_ACCESS_TOKEN_ACTION,
} from '../action-types/auth';
import initialAuthState from '../initial-state/auth';
import update from '../../public/utils/immutable-update';
import schema from '../../common/schema';

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
        console.warn('Access token schema has changed.');
        return {};
    }
};

// REDUCERS

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

const reducers = {
    [LOGIN_ACTION]: login,
    [AUTHENTICATE_ACTION]: authenticate,
    [LOGOUT_ACTION]: logout,
    [SET_ACCESS_TOKEN_ACTION]: setAccessToken,
};

const authReducer = (state = initialAuthState, action) => {
    const { type } = action;
    const reducer = reducers[type];
    if (!reducer) {
        return state;
    }
    return reducer(state, action);
};

export default authReducer;
