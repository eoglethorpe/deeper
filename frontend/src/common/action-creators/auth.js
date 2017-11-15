import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
    AUTHENTICATE_ACTION,

    SET_ACCESS_TOKEN_ACTION,
} from '../action-types/auth';

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
