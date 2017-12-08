import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import browserHistory from './common/browserHistory';

import App from './App';
import store from './common/store';
import storeConfig from './common/config/store';

import reduxSync from './public/utils/redux-sync';


export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;

        console.info('React version:', React.version);
    }

    componentWillMount() {
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        // NOTE: We can also use PersistGate instead of callback to wait for rehydration
        const persistor = persistStore(this.store, undefined, afterRehydrateCallback);
        reduxSync(
            this.store,
            persistor,
            ['siloDomainData'],
            storeConfig.key,
        );
    }

    render() {
        if (!this.state.rehydrated) {
            // NOTE: showing empty div, this lasts for a fraction of a second
            return (
                <div />
            );
        }

        return (
            <Provider store={this.store}>
                <Router history={browserHistory}>
                    <App />
                </Router>
            </Provider>
        );
    }
}
