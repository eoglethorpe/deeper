import localforage from 'localforage';
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
        },
    }),
    undefined,
    { whitelist: ['siloDomainData'] },
);

const storeConfig = {
    blacklist: ['notify', 'route', 'lang', 'app'],
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
