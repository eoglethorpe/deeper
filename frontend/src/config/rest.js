import { RestRequest } from '../vendor/react-store/utils/rest';

// Alias for prepareQueryParams
export const p = RestRequest.prepareUrlParams;

const reactAppApiHttps = location.protocol === 'https:'
    ? 'https'
    : process.env.REACT_APP_API_HTTPS;

export const wsEndpoint = (() => {
    if (!process.env.REACT_APP_API_END) {
        return 'http://localhost:8000/api/v1';
    }
    return `${reactAppApiHttps}://${process.env.REACT_APP_API_END}/api/v1`;
})();

export const adminEndpoint = (() => {
    if (!process.env.REACT_APP_ADMIN_END) {
        return 'http://localhost:8000/admin/';
    }
    return `${reactAppApiHttps}://${process.env.REACT_APP_ADMIN_END}/admin/`;
})();

export const POST = 'POST';
export const GET = 'GET';
export const PUT = 'PUT';
export const DELETE = 'DELETE';
export const PATCH = 'PATCH';

export const commonHeaderForPostExternal = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
export const authorizationHeaderForPost = {
};
export const commonHeaderForPost = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
