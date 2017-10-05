import { compose, createStore, applyMiddleware } from 'redux';
import { autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';
import logger from './middlewares/logger';
import createRefreshAccessToken from './middlewares/refreshAccessToken';

import reducer from './reducers';

// refresh every 10min
// const refreshAccessToken = createRefreshAccessToken(1000 * 60 * 10);
const refreshAccessToken = createRefreshAccessToken(1000 * 20);

const middleware = [
    // TODO: add jwt-token-refresher
    thunk,
    refreshAccessToken,
    logger,
];

const enhancer = compose(
    autoRehydrate(),
    applyMiddleware(...middleware),
);

// TODO: swap undefined to initialState later if required
export default createStore(reducer, undefined, enhancer);
