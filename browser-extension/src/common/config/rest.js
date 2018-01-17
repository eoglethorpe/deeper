import { RestRequest } from '../../public/utils/rest';
import store from '../store';
import { tokenSelector } from '../selectors/auth';
import { serverAddressSelector } from '../selectors/settings';

// TODO: Remove this on release
const DEV = true;

// Alias for prepareQueryParams
export const p = RestRequest.prepareUrlParams;

export const getServerAddress = (type = 'api') => {
    if (!DEV) {
        return serverAddressSelector(store.getState());
    }
    if (type === 'web') {
        return 'http://localhost:3000';
    } else if (type === 'api') {
        return 'http://localhost:8000';
    }
    return undefined;
};

export const getWSEndpoint = () => (`${getServerAddress()}/api/v1`);

export const POST = 'POST';
export const GET = 'GET';
export const PUT = 'PUT';
export const DELETE = 'DELETE';
export const PATCH = 'PATCH';

export const commonHeaderForPostExternal = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const commonHeader = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: undefined,
};


let currentAccess;
store.subscribe(() => {
    const prevAccess = currentAccess;
    const token = tokenSelector(store.getState());
    currentAccess = token.access;
    if (prevAccess !== currentAccess) {
        if (currentAccess) {
            commonHeader.Authorization = `Bearer ${currentAccess}`;
        } else {
            commonHeader.Authorization = undefined;
        }
    }
});
