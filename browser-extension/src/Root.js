import React from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import App from './App';
import store from './common/store';

export default class Root extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;

        console.info('React version:', React.version);
    }

    componentWillMount() {
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        persistStore(this.store, undefined, afterRehydrateCallback);
    }

    render() {
        if (!this.state.rehydrated) {
            // NOTE: showing empty div, this lasts for a fraction of a second
            return (
                <div />
            );
        }

        return (
            <Provider store={store}>
                <App />
            </Provider>
        );
    }
}
