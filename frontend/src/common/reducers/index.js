import { persistCombineReducers } from 'redux-persist';

import authReducer from './auth';
import domainDataReducer from './domainData';
import siloDomainDataReducer from './siloDomainData';

import storeConfig from '../config/store';

const reducers = {
    auth: authReducer,
    domainData: domainDataReducer,
    siloDomainData: siloDomainDataReducer,
};

const appReducer = persistCombineReducers(storeConfig, reducers);
export default appReducer;
