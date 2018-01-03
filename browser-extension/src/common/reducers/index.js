import { persistCombineReducers } from 'redux-persist';
import domainDataReducer from './domainData';
import memReducer from './mem';

import storeConfig from '../config/store';

const reducers = {
    domainData: domainDataReducer,
    mem: memReducer,
};

const appReducer = persistCombineReducers(storeConfig, reducers);
export default appReducer;
