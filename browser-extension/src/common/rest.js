import {
    getWSEndpoint,
    getServerAddress,
    GET,
    POST,
    commonHeader,
    p,
} from './config/rest';

export const createUrlForProjects = () => (`${getWSEndpoint()}/projects/`);

const projectListFields = ['id', 'title'];
export const createUrlForProjectList = () => (
    `${getWSEndpoint()}/projects/?${p({ fields: projectListFields })}`
);
export const createParamsForProjectList = () => ({
    method: GET,
    headers: commonHeader,
});

export const createUrlForLeadOptions = projectId => `${getWSEndpoint()}/lead-options/?project=${projectId}`;
export const createParamsForLeadOptions = () => ({
    method: GET,
    headers: commonHeader,
});


export const createUrlForTokenRefresh = () => (`${getWSEndpoint()}/token/refresh/`);
export const createParamsForTokenRefresh = ({ refresh }) => ({
    method: POST,
    headers: commonHeader,
    body: JSON.stringify({
        refresh,
    }),
});

export const urlForLeadCreate = `${getWSEndpoint()}/leads/`;
export const createParamsForLeadCreate = data => ({
    method: POST,
    headers: commonHeader,
    body: JSON.stringify(data),
});

export const createUrlForBrowserExtensionPage = () => (`${getServerAddress('web')}/browser-extension/`);
