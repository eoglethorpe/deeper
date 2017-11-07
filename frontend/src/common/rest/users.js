import { wsEndpoint, GET, POST, PATCH, commonHeaderForPost } from './index';

export const urlForUserCreate = `${wsEndpoint}/users/`;
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
        displayPicture: null,
    }),
});

export const createUrlForUser = userId => `${wsEndpoint}/users/${userId}/`;
export const createParamsForUser = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createUrlForUserPatch = userId => `${wsEndpoint}/users/${userId}/`;
export const createParamsForUserPatch = ({ access }, {
    firstName,
    lastName,
    organization,
}) => ({
    method: PATCH,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        firstName,
        lastName,
        organization,
    }),
});
