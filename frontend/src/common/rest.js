const wsEndpoint = '/api/v1';
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
export const urlForTokenRefresh = `${wsEndpoint}/token/refresh/`;

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

export const createParamsForTokenRefresh = ({ refresh }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        refresh,
    }),
});
