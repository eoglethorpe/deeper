import { combineReducers } from 'redux';

const appReducer = combineReducers({
    dummyReducer: (initialState = {}) => initialState,
});

export default appReducer;
