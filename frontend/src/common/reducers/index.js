import { combineReducers } from 'redux';
import authReducer from './auth';

const appReducer = combineReducers({
    auth: authReducer,
});

export default appReducer;
