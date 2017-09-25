import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import configureStore from './common/utils/configureStore';
import App from './App';

// FIXME: configure this somewhere else so that it can be referenced
// from elsewhere
const store = configureStore();

export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;
    }

    componentWillMount() {
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        // FIXME: load params and pass it instead of undefined
        persistStore(this.store, undefined, () => afterRehydrateCallback);
    }

    render() {
        if (!this.state.rehydrated) {
            // Empty div unless the redux store is not rehydrated
            return (
                <div />
            );
        }

        return (
            <Provider store={this.store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        );
    }
}
