import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
    commonHeaderForPostExternal,
} from '../config/rest';

export const urlForTokenCreate = `${wsEndpoint}/token/`;
export const createParamsForTokenCreate = ({ username, password }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        username,
        password,
    }),
});

export const urlForTokenRefresh = `${wsEndpoint}/token/refresh/`;
export const createParamsForTokenRefresh = ({ refresh }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        refresh,
    }),
});

export const urlForTokenCreateHid = `${wsEndpoint}/token/hid/`;
export const createParamsForTokenCreateHid = ({ access_token, expires_in, state, token_type }) => ({
    method: POST,
    headers: commonHeaderForPostExternal,
    body: JSON.stringify({
        accessToken: access_token,
        expiresIn: expires_in,
        state,
        tokenType: token_type,
    }),
});
