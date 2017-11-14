import { combineReducers } from 'redux';
import authReducer from './auth';
import domainDataReducer from './domainData';
import siloDomainDataReducer from './siloDomainData';
import datetimeReducer from './datetime';
import navbarReducer from './navbar';

import { LOGOUT_ACTION } from '../action-types/auth';

const appReducer = combineReducers({
    auth: authReducer,
    domainData: domainDataReducer,
    datetime: datetimeReducer,
    siloDomainData: siloDomainDataReducer,
    navbar: navbarReducer,
});

const rootReducer = (state, action) => {
    if (action.type === LOGOUT_ACTION) {
        // const { nav, auth } = state;
        // state = { nav, auth: { isLoggedIn: false, username: auth.username } };
        return appReducer({}, action);
    }
    return appReducer(state, action);
};

export default rootReducer;
