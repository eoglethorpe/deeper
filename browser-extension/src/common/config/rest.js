import { RestRequest } from '../../vendor/react-store/utils/rest';
import store from '../store';
import { tokenSelector } from '../selectors/auth';
import {
    serverAddressSelector,
    apiAddressSelector,
} from '../selectors/settings';

// TODO: Remove this on release
export const DEV = false;

// Alias for prepareQueryParams
export const p = RestRequest.prepareUrlParams;

export const getServerAddress = (type = 'api') => {
    if (!DEV) {
        if (type === 'web') {
            return serverAddressSelector(store.getState());
        } else if (type === 'api') {
            return apiAddressSelector(store.getState());
        }
        return undefined;
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
