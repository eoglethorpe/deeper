import { persistCombineReducers } from 'redux-persist';
import authReducer from './auth';
import domainDataReducer from './domainData';
import memReducer from './mem';
import settingsReducer from './settings';

import storeConfig from '../config/store';

const reducers = {
    auth: authReducer,
    domainData: domainDataReducer,
    mem: memReducer,
    settings: settingsReducer,
};

const appReducer = persistCombineReducers(storeConfig, reducers);
export default appReducer;
