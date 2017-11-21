// import localforage from 'localforage';

const storeConfig = {
    blacklist: ['websocket', 'domainData', 'datetime', 'navbar', 'siloDomainData'],
    // storage: localforage,
    keyPrefix: 'deeper-',
    // TODO: add transforms
};
export default storeConfig;
