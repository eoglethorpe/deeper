import { wsEndpoint, GET, POST, PATCH, p, commonHeaderForPost } from '../config/rest';

export const createUrlForUsers = (fields) => {
    if (fields) {
        return `${wsEndpoint}/users/?${p({ fields })}`;
    }
    return `${wsEndpoint}/users/`;
};

export const urlForUserCreate = `${wsEndpoint}/users/`;
export const createParamsForUserCreate = ({
    firstName, lastName, organization, country, email, displayPicture, recaptchaResponse,
}) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        firstName,
        lastName,
        organization,
        country,
        email,
        username: email,
        displayPicture,
        recaptchaResponse,
    }),
});

export const createUrlForUser = userId => `${wsEndpoint}/users/${userId}/`;
export const createParamsForUser = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

export const createUrlForUserPatch = userId => `${wsEndpoint}/users/${userId}/`;
export const createParamsForUserPatch = ({
    firstName,
    lastName,
    organization,
    displayPicture,
}) => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        firstName,
        lastName,
        organization,
        displayPicture,
    }),
});

export const createUrlForSetUserProject = userId => `${wsEndpoint}/users/${userId}/`;
export const createParamsForSetUserProject = projectId => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        lastActiveProject: projectId,
    }),
});

export const urlForUserPasswordReset = `${wsEndpoint}/password/reset/`;
export const createParamsForUserPasswordReset = ({ email, recaptchaResponse }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ email, recaptchaResponse }),
});

