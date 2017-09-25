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
        // persistStore(this.store, undefined, () => afterRehydrateCallback);
        persistStore(this.store, undefined, afterRehydrateCallback);
    }

    getRandomLoadingMessage = () => {
        const lines = [
            'Locating the required gigapixels to render ...',
            'Spinning up the hamster ...',
            'Shovelling coal into the server ...',
            'Programming the flux capacitor ...',
        ];

        return lines[Math.round(Math.random() * (lines.length - 1))];
    }

    render() {
        if (!this.state.rehydrated) {
            // A simple message till the redux store is not rehydrated
            return (
                <div
                    style={{
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    { this.getRandomLoadingMessage() }
                </div>
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
