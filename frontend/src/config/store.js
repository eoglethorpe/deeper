import localforage from 'localforage';
// import localStorage from 'redux-persist/lib/storage';

const storeConfig = {
    // blacklist: ['domainData', 'siloDomainData'],
    blacklist: ['notify', 'route', 'lang', 'app'],
    key: 'deeper',
    version: 1,
    // storage: localStorage,
    storage: localforage,
};

export const reducersToSync = [
    'lang',
    'auth',
    'domainData',
    'siloBgTasks', // Middleware
];

export default storeConfig;
