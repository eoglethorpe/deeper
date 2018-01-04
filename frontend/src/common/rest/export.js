import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
} from '../config/rest';


export const urlForExportTrigger = `${wsEndpoint}/export-trigger/`;
export const urlForExports = `${wsEndpoint}/exports/`;

export const createUrlForExport = exportId => `${urlForExports}${exportId}/`;

export const createParamsForExportTrigger = filters => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        filters: Object.entries(filters),
    }),
});
