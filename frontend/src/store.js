import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from './redux/middlewares/logger';
import siloBackgroundTasks from './redux/middlewares/siloBackgroundTasks';
import { sendToken } from './utils/browserExtension';
import { commonHeaderForPost, authorizationHeaderForPost } from './config/rest';

import reducer from './redux/reducers';

// Invoke refresh access token every 10m
const middleware = [
    logger,
    siloBackgroundTasks,
    thunk,
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
    applyMiddleware(...middleware),
);

// NOTE: replace undefined with an initialState if required
const store = createStore(reducer, undefined, enhancer);

const noOp = () => {};

if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line global-require
    const tokenSelector = require('./redux/selectors/auth').tokenSelector;

    let currentAccess;
    let currentRefresh;
    store.subscribe(() => {
        const prevAccess = currentAccess;
        const prevRefresh = currentRefresh;
        const token = tokenSelector(store.getState());
        currentAccess = token.access;
        currentRefresh = token.refresh;
        if (prevAccess !== currentAccess) {
            if (currentAccess) {
                commonHeaderForPost.Authorization = `Bearer ${currentAccess}`;
                authorizationHeaderForPost.Authorization = `Bearer ${currentAccess}`;
            } else {
                commonHeaderForPost.Authorization = undefined;
                authorizationHeaderForPost.Authorization = undefined;
            }
        }

        if (prevRefresh !== currentRefresh) {
            sendToken(token).then(noOp, noOp);
        }
    });
}

export default store;
