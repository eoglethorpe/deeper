import { combineReducers } from 'redux';
import authReducer from './auth';
import domainDataReducer from './domainData';
import datetimeReducer from './datetime';

const appReducer = combineReducers({
    auth: authReducer,
    domainData: domainDataReducer,
    datetime: datetimeReducer,
});

export default appReducer;
