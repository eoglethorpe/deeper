import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    BrowserRouter,
} from 'react-router-dom';

import { FgRestBuilder } from './public/utils/rest';
import { getRandomFromList } from './public/utils/common';

import schema from './common/schema';
import {
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from './common/rest';
import {
    startRefreshAction,
    stopRefreshAction,
} from './common/middlewares/refresher';
import {
    startSiloBackgroundTasksAction,
    stopSiloBackgroundTasksAction,
} from './common/middlewares/siloBackgroundTasks';
import {
    setAccessTokenAction,

    logoutAction,
    tokenSelector,
    currentUserProjectsSelector,
} from './common/redux';

import Multiplexer from './Multiplexer';

const mapStateToProps = state => ({
    currentUserProjects: currentUserProjectsSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAccessToken: access => dispatch(setAccessTokenAction(access)),
    startRefresh: params => dispatch(startRefreshAction(params)),
    stopRefresh: () => dispatch(stopRefreshAction()),
    startSiloTasks: params => dispatch(startSiloBackgroundTasksAction(params)),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
    logout: () => dispatch(logoutAction()),
});

const propTypes = {
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line
    setAccessToken: PropTypes.func.isRequired,
    startRefresh: PropTypes.func.isRequired,
    stopRefresh: PropTypes.func.isRequired,
    startSiloTasks: PropTypes.func.isRequired,
    stopSiloTasks: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    logout: PropTypes.func.isRequired,
};

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

        this.props.stopRefresh();
        this.props.stopSiloTasks();
    }

    createRequestForRefresh = () => {
        const { refresh } = this.props.token;
        const refreshRequest = new FgRestBuilder()
            .url(urlForTokenRefresh)
            .params(() => createParamsForTokenRefresh({ refresh }))
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
                        this.props.startRefresh(() => {
                            this.setState({ pending: false });
                        });
                    } else {
                        // set pending to false irrespective of api call
                        this.props.startRefresh();
                        this.setState({ pending: false });
                    }

                    // Start the locked silo tasks
                    this.props.startSiloTasks(() => {
                        console.log('Silo tasks started');
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                this.props.logout();
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                // TODO: something wrong with the internet or server
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
            <BrowserRouter>
                <Multiplexer />
            </BrowserRouter>
        );
    }
}
