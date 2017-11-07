import { RestRequest } from '../../public/utils/rest';

// Alias for prepareQueryParams
export const p = RestRequest.prepareUrlParams;

export const wsEndpoint = (() => {
    if (!process.env.REACT_APP_API_END) {
        return '/api/v1';
    }
    const reactAppApiHttps = location.protocol === 'https:'
        ? 'https'
        : process.env.REACT_APP_API_HTTPS;
    return `${reactAppApiHttps}://${process.env.REACT_APP_API_END}/api/v1`;
})();

export const POST = 'POST';
export const GET = 'GET';
export const PUT = 'PUT';
export const DELETE = 'DELETE';
export const PATCH = 'PATCH';

export const commonHeaderForPost = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
