import localforage from 'localforage';
<<<<<<< HEAD
import { createTransform } from 'redux-persist';

const myTransform = createTransform(
    inboundState => ({
        ...inboundState,
        addLeadView: {
            ...inboundState.addLeadView,
            leadRests: undefined,
            leadUploads: undefined,
            leadDriveRests: undefined,
            leadDropboxRests: undefined,

            removeModal: undefined,
        },
    }),
    undefined,
    { whitelist: ['siloDomainData'] },
);

const storeConfig = {
    blacklist: ['notify', 'route', 'app'],
    key: 'deeper',
    version: 1,
    storage: localforage,
    transforms: [myTransform],
};

export const reducersToSync = [
    'lang',
    'auth',
    'domainData',
    'siloBgTasks', // Middleware
];

export default storeConfig;
