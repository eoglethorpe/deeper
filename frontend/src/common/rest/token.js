import { wsEndpoint, POST, commonHeaderForPost } from '../config/rest';

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
export const createParamsForTokenRefresh = ({ refresh, access }) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        refresh,
    }),
});

export const urlForTokenCreateHid = `${wsEndpoint}/token/hid/`;
export const createParamsForTokenCreateHid = ({ access_token, expires_in, state, token_type }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        accessToken: access_token,
        expiresIn: expires_in,
        state,
        tokenType: token_type,
    }),
});
