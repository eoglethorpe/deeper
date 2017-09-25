import {
    LOGIN_ACTION,
    LOGOUT_ACTION,
    REGISTER_ACTION,
} from '../action-types/auth';

export const login = (email, token) => ({
    type: LOGIN_ACTION,
    email,
    token,
});

export const logout = () => ({
    type: LOGOUT_ACTION,
});

export const register = (firstname, lastname, organization, country, email, password) => ({
    type: REGISTER_ACTION,
    firstname,
    lastname,
    organization,
    country,
    email,
    password,
});
