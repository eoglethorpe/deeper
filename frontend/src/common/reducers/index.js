import { combineReducers } from 'redux';
import authReducer from './auth';
import domainDataReducer from './domainData';
import datetimeReducer from './datetime';
import navbarReducer from './navbar';

const appReducer = combineReducers({
    auth: authReducer,
    domainData: domainDataReducer,
    datetime: datetimeReducer,
    navbar: navbarReducer,
});

export default appReducer;
