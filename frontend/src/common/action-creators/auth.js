import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
} from '../action-types/auth';

export const login = (email, password) => ({
    type: LOGIN_ACTION,
    email,
    password,
});

export const logout = () => ({
    type: LOGOUT_ACTION,
});
