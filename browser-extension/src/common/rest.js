import {
    wsEndpoint,
    GET,
    POST,
    commonHeader,
    p,
} from './config/rest';

export const urlForProjects = `${wsEndpoint}/projects/`;

const projectListFields = ['id', 'title'];
export const createUrlForProjectList = () => (
    `${wsEndpoint}/projects/?${p({ fields: projectListFields })}`
);

export const createUrlForProjectOptions = projectId => `${wsEndpoint}/project-options/?project=${projectId}`;

export const createParamsForProjectList = () => ({
    method: GET,
    headers: commonHeader,
});

export const createParamsForProjectOptions = () => ({
    method: GET,
    headers: commonHeader,
});


export const urlForTokenRefresh = `${wsEndpoint}/token/refresh/`;
export const createParamsForTokenRefresh = ({ refresh }) => ({
    method: POST,
    headers: commonHeader,
    body: JSON.stringify({
        refresh,
    }),
});
