import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
    commonHeaderForPostExternal,
} from '../config/rest';

export const urlForTokenCreate = `${wsEndpoint}/token/`;
export const createParamsForTokenCreate = ({ username, password, recaptchaResponse }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        username,
        password,
        recaptchaResponse,
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
export const createParamsForTokenCreateHid = ({
    accessToken,
    expiresIn,
    state,
    tokenType,
}) => ({
    method: POST,
    headers: commonHeaderForPostExternal,
    body: JSON.stringify({
        accessToken,
        expiresIn,
        state,
        tokenType,
    }),
});
