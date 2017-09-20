import { compose, createStore, applyMiddleware } from 'redux';
import { autoRehydrate } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';

import reducer from '../reducers';

export default function configureStore(preloadedState) {
    return createStore(
        reducer,
        preloadedState,
        compose(
            applyMiddleware(
                thunkMiddleware,
            ),
            autoRehydrate(),
        ),
    );
}
