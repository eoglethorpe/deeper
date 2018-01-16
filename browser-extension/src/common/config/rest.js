import { RestRequest } from '../../public/utils/rest';
import store from '../store';
import { tokenSelector } from '../selectors/auth';
import { serverAddressSelector } from '../selectors/settings';


// Alias for prepareQueryParams
export const p = RestRequest.prepareUrlParams;

export const getServerAddress = () => (
    serverAddressSelector(store.getState())
);

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
