import localforage from 'localforage';

const storeConfig = {
    blacklist: ['mem'],
    key: 'deeper-extension',
    storage: localforage,
};
export default storeConfig;
