import React from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import { startActionsSync } from './vendor/react-store/utils/redux-sync';

import store from './store';

import App from './App';

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
        persistStore(this.store, undefined, afterRehydrateCallback);
        startActionsSync(this.store);
    }

    render() {
        if (!this.state.rehydrated) {
            // NOTE: showing empty div, this lasts for a fraction of a second
            return <div />;
        }

        return (
            <Provider store={this.store}>
                <App />
            </Provider>
        );
    }
}
