import localforage from 'localforage';

const storeConfig = {
    blacklist: ['websocket'],
    storage: localforage,
    keyPrefix: 'deeper-',
    // TODO: add transforms
};
export default storeConfig;
