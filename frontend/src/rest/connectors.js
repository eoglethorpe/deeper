import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
} from '../config/rest';

export const urlForConnectors = `${wsEndpoint}/connectors/`;
export const urlForConnectorSources = `${wsEndpoint}/connector-sources/`;

export const createParamsForConnectorCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
