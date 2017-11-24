// import localforage from 'localforage';

const storeConfig = {
    // blacklist: ['websocket', 'datetime', 'navbar', 'domainData', 'siloDomainData'],
    blacklist: ['domainData', 'websocket', 'datetime', 'navbar'],
    keyPrefix: 'deeper-',
    // storage: localforage,
    // TODO: add transforms
};
export default storeConfig;
