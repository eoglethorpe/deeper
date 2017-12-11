import { persistCombineReducers } from 'redux-persist';

import authReducer from './auth';
import domainDataReducer from './domainData';
import siloDomainDataReducer from './siloDomainData';
import datetimeReducer from './datetime';

import { LOGOUT_ACTION } from '../action-types/auth';
import storeConfig from '../config/store';

const reducers = {
    auth: authReducer,
    domainData: domainDataReducer,
    datetime: datetimeReducer,
    siloDomainData: siloDomainDataReducer,
};

const appReducer = persistCombineReducers(storeConfig, reducers);
export default appReducer;
