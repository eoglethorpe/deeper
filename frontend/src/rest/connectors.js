import {
    wsEndpoint,
    POST,
    commonHeaderForPost,
} from '../config/rest';

// eslint-disable-next-line import/prefer-default-export
export const urlForConnectors = `${wsEndpoint}/connectors/`;

export const createParamsForConnectorCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
