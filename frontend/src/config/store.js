import localforage from 'localforage';
// import localStorage from 'redux-persist/lib/storage';

const storeConfig = {
    // blacklist: ['domainData', 'siloDomainData'],
    blacklist: ['notify', 'route', 'lang'],
    key: 'deeper',
    // storage: localStorage,
    storage: localforage,
};
export default storeConfig;
