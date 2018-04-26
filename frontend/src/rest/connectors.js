import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
} from '../config/rest';

export const urlForConnectors = `${wsEndpoint}/connectors/?fields=id,title,version_id,source,created_at,modified_at`;
export const createUrlForConnector = connectorId => `${wsEndpoint}/connectors/${connectorId}`;
export const urlForConnectorSources = `${wsEndpoint}/connector-sources/`;

export const createParamsForConnectorCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
