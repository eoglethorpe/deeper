import { persistCombineReducers } from 'redux-persist';

import authReducer from './auth';
import notifyReducer from './notify';
import routeReducer from './route';
import domainDataReducer from './domainData';
import siloDomainDataReducer from './siloDomainData';

import storeConfig from '../config/store';

const reducers = {
    notify: notifyReducer,
    route: routeReducer,
    auth: authReducer,
    domainData: domainDataReducer,
    siloDomainData: siloDomainDataReducer,
};

const appReducer = persistCombineReducers(storeConfig, reducers);
export default appReducer;
