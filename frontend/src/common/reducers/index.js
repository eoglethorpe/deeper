import { combineReducers } from 'redux';
import authReducer from './auth';
import domainDataReducer from './domainData';

const appReducer = combineReducers({
    auth: authReducer,
    domainData: domainDataReducer,
});

export default appReducer;
