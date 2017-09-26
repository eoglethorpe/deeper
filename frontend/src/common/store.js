import { compose, createStore, applyMiddleware } from 'redux';
import { autoRehydrate } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';

import reducer from './reducers';

const middleware = [
    // TODO: add jwt-token-refresher
    thunkMiddleware,
    // TODO: add logger at the end
];

const enhancer = compose(
    autoRehydrate(),
    applyMiddleware(...middleware),
);

// TODO: swap undefined to initialState later if required
export default createStore(reducer, undefined, enhancer);
