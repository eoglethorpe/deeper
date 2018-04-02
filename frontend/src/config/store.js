import localforage from 'localforage';
// import localStorage from 'redux-persist/lib/storage';

const storeConfig = {
    // blacklist: ['domainData', 'siloDomainData'],
    blacklist: ['notify', 'route', 'lang', 'app'],
    key: 'deeper',
    // storage: localStorage,
    storage: localforage,
};

export const reducersToSync = [
    'auth',
    'domain-data',
    'app',
];

export default storeConfig;
