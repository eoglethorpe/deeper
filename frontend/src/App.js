import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    BrowserRouter,
} from 'react-router-dom';

import { FgRestBuilder } from './public/utils/rest';
import { getRandomFromList } from './public/utils/common';

import schema from './common/schema';

import { commonStrings } from './common/constants';
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
        commonStrings.loadingMessages1,
        commonStrings.loadingMessages2,
        commonStrings.loadingMessages3,
        commonStrings.loadingMessages4,
        commonStrings.loadingMessages5,
        commonStrings.loadingMessages6,
        commonStrings.loadingMessages7,
        commonStrings.loadingMessages8,
        commonStrings.loadingMessages9,
        commonStrings.loadingMessages10,
        commonStrings.loadingMessages11,
        commonStrings.loadingMessages12,
        commonStrings.loadingMessages13,
        commonStrings.loadingMessages14,
        commonStrings.loadingMessages15,
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
            color: 'rgba(0, 0, 0, 0.5)',
            fontSize: '2em',
        };
    }

    componentWillMount() {
        console.log('Mounting App');

        // If there is no refresh token, no need to get a new access token
        const { token: { refresh: refreshToken } } = this.props;
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

        const { stopRefresh, stopSiloTasks } = this.props;
        stopRefresh();
        stopSiloTasks();
    }

    createRequestForRefresh = () => {
        const {
            token: { refresh },
            setAccessToken,
            currentUserProjects,
            startRefresh,
            startSiloTasks,
            logout,
        } = this.props;
        const refreshRequest = new FgRestBuilder()
            .url(urlForTokenRefresh)
            .params(() => createParamsForTokenRefresh({ refresh }))
            .success((response) => {
                try {
                    schema.validate(response, 'tokenRefreshResponse');
                    const { access } = response;
                    setAccessToken(access);

                    // NOTE: after setAccessToken, current user is verified
                    // If there is no projects, block the user until it is retrieved
                    if (currentUserProjects.length <= 0) {
                        console.info('No projects in cache');
                        // set pending to false after api call is complete
                        startRefresh(() => {
                            this.setState({ pending: false });
                        });
                    } else {
                        // set pending to false irrespective of api call
                        startRefresh();
                        this.setState({ pending: false });
                    }

                    // Start the locked silo tasks
                    startSiloTasks(() => {
                        console.log('Silo tasks started');
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                logout();
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
