import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
    SET_ACCESS_TOKEN_ACTION,
} from '../action-types/auth';

export const loginAction = ({ email, access, refresh }) => ({
    type: LOGIN_ACTION,
    email,
    access,
    refresh,
});

export const logoutAction = () => ({
    type: LOGOUT_ACTION,
});

export const setAccessTokenAction = access => ({
    type: SET_ACCESS_TOKEN_ACTION,
    access,
});
