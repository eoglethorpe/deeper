import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Multiplexer from './Multiplexer';
import schema from './common/schema';
import styles from './styles.scss';
import { RestBuilder } from './public/utils/rest';
import { getRandomFromList } from './public/utils/common';
import {
    setAccessTokenAction,
    setCurrentUserAction,
} from './common/action-creators/auth';
import {
    startTokenRefreshAction,
} from './common/middlewares/refreshAccessToken';
import {
    createParamsForCurrentUser,
    createParamsForTokenRefresh,
    urlForCurrentUser,
    urlForTokenRefresh,
} from './common/rest';
import {
    tokenSelector,
} from './common/selectors/auth';

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAccessToken: access => dispatch(setAccessTokenAction(access)),
    startTokenRefresh: () => dispatch(startTokenRefreshAction()),
    setCurrentUser: user => dispatch(setCurrentUserAction(user)),
});

const propTypes = {
    setAccessToken: PropTypes.func.isRequired,
    startTokenRefresh: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    setCurrentUser: PropTypes.func.isRequired,
};

@withRouter
@CSSModules(styles)
@connect(mapStateToProps, mapDispatchToProps)
export default class App extends React.PureComponent {
    static propTypes = propTypes;

    static loadingMessages = [
        'Locating the required gigapixels to render ...',
        'Programming the flux capacitor ...',
        'Shovelling coal into the server ...',
        'Spinning up the hamster ...',
    ];

    constructor(props) {
        super(props);

        // Initially the app is in pending state
        this.state = {
            pending: true,
        };

        // Get a random message from the loading message list
        this.randomMessage = getRandomFromList(App.loadingMessages);

        // Style for random message page
        this.randomMessageStyle = {
            alignItems: 'center',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
        };

        // If there is no refresh token, no need to get a new access token
        const { refresh: refreshToken } = this.props.token;
        if (!refreshToken) {
            this.state.pending = false;
            console.warn('There is no previous session');
            return;
        }

        this.currentUserRequest = new RestBuilder()
            .url(urlForCurrentUser)
            .params(() => {
                const { access } = this.props.token;
                return createParamsForCurrentUser({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(20)
            .success((response) => {
                try {
                    schema.validate(response, 'getUserResponse');
                    this.props.setCurrentUser(response);
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                // TODO: logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: user couldn't be verfied screen
            })
            .build();

        // Create rest request to get a new access token from refresh token
        this.refreshRequest = new RestBuilder()
            .url(urlForTokenRefresh)
            .params(() => {
                const { refresh } = this.props.token;
                return createParamsForTokenRefresh({ refresh });
            })
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'tokenRefreshResponse');
                    const { access } = response;
                    this.props.setAccessToken(access);
                    this.props.startTokenRefresh();
                    this.setState({ pending: false });

                    // TODO: Let's get some other data now
                    this.currentUserRequest.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                // TODO: logout and send to login screen
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: user couldn't be verfied screen
            })
            .build();
    }

    componentWillMount() {
        console.log('Mounting App');
        if (this.refreshRequest) {
            this.refreshRequest.start();
        }
    }

    componentWillUnmount() {
        console.log('Unmounting App');
        if (this.refreshRequest) {
            this.refreshRequest.stop();
        }
        if (this.currentUserRequest) {
            this.currentUserRequest.stop();
        }
    }

    render() {
        console.log('Rendering App');

        if (this.state.pending) {
            // Show loading screen until access token is retrieved
            return (
                <div style={this.randomMessageStyle} >
                    { this.randomMessage }
                </div>
            );
        }

        return (
            <Multiplexer />
        );
    }
}
