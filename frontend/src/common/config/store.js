import localforage from 'localforage';

const storeConfig = {
    blacklist: ['websocket', 'domainData', 'datetime'],
    storage: localforage,
    keyPrefix: 'deeper-',
    // TODO: add transforms
};
export default storeConfig;
