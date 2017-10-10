import { compose, createStore, applyMiddleware } from 'redux';
import { autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';
import logger from './middlewares/logger';
import createRefreshAccessToken from './middlewares/refreshAccessToken';

import reducer from './reducers';

// refresh every 10min
const refreshAccessToken = createRefreshAccessToken(1000 * 60 * 10);

const middleware = [
    thunk,
    refreshAccessToken,
    logger,
];


/* eslint-disable no-underscore-dangle */
// Modifying composer to support Redux DevTools
const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    })
    : compose;

const enhancer = composeEnhancers(
    autoRehydrate(),
    applyMiddleware(...middleware),
);
/* eslint-enable */

// TODO: swap undefined to initialState later if required
export default createStore(reducer, undefined, enhancer);
