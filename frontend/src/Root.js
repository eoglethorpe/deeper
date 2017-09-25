import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import browserHistory from './common/utils/routerUtils';

import App from './App';
import store from './common/store';
import storeConfig from './common/config/store';
import { getRandomFromList } from './public/utils/common';

export default class Root extends React.Component {
    static loadingMessages = [
        'Locating the required gigapixels to render ...',
        'Spinning up the hamster ...',
        'Shovelling coal into the server ...',
        'Programming the flux capacitor ...',
    ];

    constructor(props) {
        super(props);

        this.state = { rehydrated: false };
        this.store = store;

        // TODO: rehydrating is very shortlived, so better move this code
        // when a new token is retrieved for the first time
        this.randomMessage = getRandomFromList(Root.loadingMessages);
        this.randomMessageStyle = {
            alignItems: 'center',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
        };
    }

    componentWillMount() {
        console.log('Mounting Root');
        const afterRehydrateCallback = () => this.setState({ rehydrated: true });
        persistStore(this.store, storeConfig, afterRehydrateCallback);
    }

    render() {
        if (!this.state.rehydrated) {
            // A simple message till the redux store is not rehydrated
            return (
                <div style={this.randomMessageStyle} >
                    { this.randomMessage }
                </div>
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
