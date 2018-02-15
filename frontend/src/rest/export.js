import {
    wsEndpoint,
    POST,
    GET,
    commonHeaderForPost,
} from '../config/rest';
import {
    processEntryFilters,
} from './entries';


export const urlForExportTrigger = `${wsEndpoint}/export-trigger/`;
export const urlForExports = `${wsEndpoint}/exports/`;
export const createUrlForExportsOfProject = projectId => (
    `${wsEndpoint}/exports/?project=${projectId}&is_preview=0`
);

export const createUrlForExport = exportId => `${urlForExports}${exportId}/`;

export const createParamsForExportTrigger = filters => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        filters: processEntryFilters(Object.entries(filters)),
    }),
});

export const createParamsForUserExportsGET = () => ({
    method: GET,
    headers: commonHeaderForPost,
});
