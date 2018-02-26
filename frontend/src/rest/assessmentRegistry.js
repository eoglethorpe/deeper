import {
    GET,
    wsEndpoint,
    commonHeaderForPost,
} from '../config/rest';

export const urlForAryTemplates = `${wsEndpoint}/assessment-templates/`;
export const createUrlForAryTemplate = id => `${wsEndpoint}/assessment-templates/${id}/`;

export const commonParamsForGET = () => ({
    method: GET,
    headers: commonHeaderForPost,
});
