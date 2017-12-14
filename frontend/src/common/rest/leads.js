import {
    wsEndpoint,
    POST,
    PUT,
    commonHeaderForPost,
    p,
} from '../config/rest';

// do no use this, use urlForLead instead
export const urlForLeadCreate = `${wsEndpoint}/leads/`;
export const urlForLead = `${wsEndpoint}/leads/`;
export const urlForWebsiteFetch = `${wsEndpoint}/lead-webiste-fetch/`;
export const createUrlForLead = leadId => `${urlForLead}${leadId}/`;

export const createParamsForLeadCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForLeadEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createUrlForLeadsOfProject = params => (
    `${wsEndpoint}/leads/?${p(params)}`
);

export const createUrlForLeadEdit = leadId => (
    `${wsEndpoint}/leads/${leadId}/`
);

export const createParamsForWebsiteFetch = url => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ url }),
});
