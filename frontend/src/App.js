import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { RestBuilder } from './public/utils/rest';
import { getRandomFromList } from './public/utils/common';

import schema from './common/schema';
import {
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from './common/rest';
import { startTokenRefreshAction } from './common/middlewares/refreshAccessToken';
import {
    setAccessTokenAction,

    tokenSelector,
    currentUserProjectsSelector,
} from './common/redux';

import Multiplexer from './Multiplexer';
import styles from './styles.scss';

const mapStateToProps = state => ({
    currentUserProjects: currentUserProjectsSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAccessToken: access => dispatch(setAccessTokenAction(access)),
    startTokenRefresh: params => dispatch(startTokenRefreshAction(params)),
});

const propTypes = {
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line
    setAccessToken: PropTypes.func.isRequired,
    startTokenRefresh: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
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

        this.state = { pending: true };

        // Get a random message from the loading message list
        this.randomMessage = getRandomFromList(App.loadingMessages);

        // Style for random message page
        this.randomMessageStyle = {
            alignItems: 'center',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
        };
    }

    componentWillMount() {
        console.log('Mounting App');

        // If there is no refresh token, no need to get a new access token
        const { refresh: refreshToken } = this.props.token;
        if (!refreshToken) {
            console.info('There is no previous session');
            this.setState({ pending: false });
            return;
        }

        // Create rest request to get a new access token from refresh token
        this.refreshRequest = this.createRequestForRefresh();
        this.refreshRequest.start();
    }

    componentWillUnmount() {
        console.log('Unmounting App');
        if (this.refreshRequest) {
            this.refreshRequest.stop();
        }
    }

    createRequestForRefresh = () => {
        const refreshRequest = new RestBuilder()
            .url(urlForTokenRefresh)
            .params(() => {
                const { refresh, access } = this.props.token;
                return createParamsForTokenRefresh({ refresh, access });
            })
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'tokenRefreshResponse');
                    const { access } = response;
                    this.props.setAccessToken(access);

                    // NOTE: after setAccessToken, current user is verified
                    // If there is no projects, block the user until it is retrieved
                    if (this.props.currentUserProjects.length <= 0) {
                        console.info('No projects in cache');
                        // set pending to false after api call is complete
                        this.props.startTokenRefresh(() => {
                            this.setState({ pending: false });
                        });
                    } else {
                        // set pending to false irrespective of api call
                        this.props.startTokenRefresh();
                        this.setState({ pending: false });
                    }
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
        return refreshRequest;
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
