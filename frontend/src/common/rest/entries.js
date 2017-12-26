import {
    wsEndpoint,
    GET,
    POST,
    PUT,
    DELETE,
    p,
    commonHeaderForPost,
} from '../config/rest';

export const urlForEntry = `${wsEndpoint}/entries/`;
export const urlForEntryCreate = `${wsEndpoint}/entries/`;
export const urlForFilteredEntries = `${wsEndpoint}/entries/filter/`;

export const createUrlForEntryEdit = entryId => (
    `${wsEndpoint}/entries/${entryId}/`
);
export const createUrlForEntries = projectId => (
    `${wsEndpoint}/entries/?project=${projectId}`
);

export const createParamsForEntry = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

export const createParamsForFilteredEntries = filters => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        filters: Object.entries(filters),
    }),
});

export const createParamsForEntryCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForEntryEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createUrlForEntriesOfLead = leadId => (
    `${wsEndpoint}/entries/?${p({ lead: leadId })}`
);
export const createParamsForEntriesOfLead = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

export const createUrlForDeleteEntry = entryId => (
    `${wsEndpoint}/entries/${entryId}/`
);
export const createParamsForDeleteEntry = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});
