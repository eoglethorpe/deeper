let wsEndpoint;
if (process.env.REACT_APP_API_END) {
    wsEndpoint = `${process.env.REACT_APP_API_HTTPS}://${process.env.REACT_APP_API_END}/api/v1`;
} else {
    wsEndpoint = '/api/v1';
}
const POST = 'POST';
const GET = 'GET'; // eslint-disable-line
const PUT = 'PUT'; // eslint-disable-line
const DELETE = 'DELETE'; // eslint-disable-line
const PATCH = 'PATCH'; // eslint-disable-line

const commonHeaderForPost = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const urlForUserCreate = `${wsEndpoint}/users/`;
export const urlForTokenCreate = `${wsEndpoint}/token/`;
export const urlForTokenCreateHid = `${wsEndpoint}/token/hid/`;
export const urlForTokenRefresh = `${wsEndpoint}/token/refresh/`;

export const createUrlForUser = userId => `${wsEndpoint}/users/${userId}/`;

export const createParamsForUserCreate = ({
    firstName, lastName, organization, country, email, password,
}) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        firstName,
        lastName,
        organization,
        country,
        email,
        password,
        username: email,
    }),
});

export const createParamsForTokenCreate = ({ username, password }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        username,
        password,
    }),
});

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

export const createParamsForUser = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
