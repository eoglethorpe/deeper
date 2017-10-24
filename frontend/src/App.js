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
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from './common/rest';
import {
    startTokenRefreshAction,
} from './common/middlewares/refreshAccessToken';
import {
    setAccessTokenAction,
} from './common/action-creators/auth';
import {
    tokenSelector,
} from './common/selectors/auth';
import {
    currentUserProjectsSelector,
} from './common/selectors/domainData';

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
            console.warn('There is no previous session');
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

                    // after setAccessToken, current user is verified
                    if (this.props.currentUserProjects.length <= 0) {
                        console.warn('No projects in cache');
                        // if there is no projects, block and get from api
                        this.props.startTokenRefresh(() => {
                            this.setState({ pending: false });
                        });
                    } else {
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
