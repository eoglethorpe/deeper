import { compose, createStore, applyMiddleware } from 'redux';
import { autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';
import logger from './middlewares/logger';
import createRefreshAccessToken from './middlewares/refreshAccessToken';

import reducer from './reducers';

// Invoke refresh access token every 10m
const refreshAccessToken = createRefreshAccessToken(1000 * 60 * 10);

const middleware = [
    thunk,
    refreshAccessToken,
    logger,
];

// Get compose from Redux Devtools Extension
// eslint-disable-next-line no-underscore-dangle
const reduxExtensionCompose = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

// Override compose if development mode and redux extension is installed
const overrideCompose = process.env.NODE_ENV === 'development' && reduxExtensionCompose;
const applicableComposer = !overrideCompose
    ? compose
    : reduxExtensionCompose({ /* specify extention's options here */ });

const enhancer = applicableComposer(
    autoRehydrate(),
    applyMiddleware(...middleware),
);

// NOTE: replace undefined with an initialState if required
export default createStore(reducer, undefined, enhancer);
