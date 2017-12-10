import { RestRequest } from '../../public/utils/rest';

import { tokenSelector } from '../selectors/auth';
import store from '../store';

// Alias for prepareQueryParams
export const p = RestRequest.prepareUrlParams;

export const wsEndpoint = (() => {
    if (!process.env.REACT_APP_API_END) {
        return 'http://localhost:8000/api/v1';
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

let currentAccess;
store.subscribe(() => {
    const prevAccess = currentAccess;
    const token = tokenSelector(store.getState());
    currentAccess = token.access;
    if (prevAccess !== currentAccess) {
        if (currentAccess) {
            commonHeaderForPost.Authorization = `Bearer ${currentAccess}`;
            authorizationHeaderForPost.Authorization = `Bearer ${currentAccess}`;
        } else {
            commonHeaderForPost.Authorization = undefined;
            authorizationHeaderForPost.Authorization = undefined;
        }
    }
});
