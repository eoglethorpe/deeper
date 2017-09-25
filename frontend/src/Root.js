import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';

import store from './common/store';
import App from './App';

export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;
    }

    componentWillMount() {
        console.log('Mounting Root');
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
                        alignItems: 'center',
                        display: 'flex',
                        height: '100vh',
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
