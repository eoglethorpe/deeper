import {
    wsEndpoint,
    GET,
    POST,
    PUT,
    PATCH,
    DELETE,
    commonHeaderForPost,
    p,
} from '../config/rest';

// do no use this, use urlForLead instead
export const urlForLead = `${wsEndpoint}/leads/`;
export const urlForWebsiteFetch = `${wsEndpoint}/lead-website-fetch/`;
export const createUrlForLead = leadId => `${urlForLead}${leadId}/`;
export const createUrlForLeadDelete = leadId => `${urlForLead}${leadId}/`;

// GET [For cache response]
export const createUrlForWebsiteFetch = url => `${wsEndpoint}/lead-website-fetch/?${p({ url })}`;

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

export const createParamsForLeadPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForLeadDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForGenericGet = () => ({
    method: GET,
    headers: commonHeaderForPost,
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

export const createUrlForSimplifiedLeadPreview = leadId => (
    `${wsEndpoint}/lead-previews/${leadId}/`
);

export const createUrlForLeadExtractionTrigger = leadId => (
    `${wsEndpoint}/lead-extraction-trigger/${leadId}/`
);

export const urlForWebInfo = `${wsEndpoint}/web-info-extract/`;
export const createParamsForWebInfo = ({ url }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({ url }),
});
