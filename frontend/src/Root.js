import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import configureStore from './common/utils/configureStore';
import App from './App';

const store = configureStore();
persistStore(store);

export default function Root() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    );
}
