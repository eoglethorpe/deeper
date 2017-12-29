import { persistCombineReducers } from 'redux-persist';
import domainDataReducer from './domainData';

import storeConfig from '../config/store';

const reducers = {
    domainData: domainDataReducer,
};

const appReducer = persistCombineReducers(storeConfig, reducers);
export default appReducer;
