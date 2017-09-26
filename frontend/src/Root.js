import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import browserHistory from './common/browserHistory';

import App from './App';
import store from './common/store';
import storeConfig from './common/config/store';

export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;
    }

    componentWillMount() {
        console.log('Mounting Root');
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        persistStore(this.store, storeConfig, afterRehydrateCallback);
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
