// import localforage from 'localforage';

const storeConfig = {
    blacklist: ['siloDomainData'],
    // blacklist: ['siloDomaindata', 'websocket', 'domainData', 'datetime', 'navbar'],
    // storage: localforage,
    keyPrefix: 'deeper-',
    // TODO: add transforms
};
export default storeConfig;
