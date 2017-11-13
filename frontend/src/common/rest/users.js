import { wsEndpoint, GET, POST, PATCH, p, commonHeaderForPost } from '../config/rest';

export const createUrlForUsers = (fields) => {
    if (fields) {
        return `${wsEndpoint}/users/?${p({ fields })}`;
    }
    return `${wsEndpoint}/users/`;
};

export const urlForUserCreate = `${wsEndpoint}/users/`;
export const createParamsForUserCreate = ({
    firstName, lastName, organization, country, email, password, displayPicture,
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
        displayPicture,
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
    displayPicture,
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
        displayPicture,
    }),
});
