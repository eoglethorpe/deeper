import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Bundle from './Bundle';
import Navbar from './common/components/Navbar';
import PrivateRoute from './public/components/PrivateRoute';
import schema from './common/schema';
import styles from './styles.scss';
import { RestBuilder } from './public/utils/rest';
import { getRandomFromList } from './public/utils/common';
import { pageTitles } from './common/utils/labels';
import { setAccessTokenAction } from './common/action-creators/auth';
import {
    startTokenRefreshAction,
} from './common/middlewares/refreshAccessToken';
import {
    createParamsForTokenRefresh,
    urlForTokenRefresh,
} from './common/rest';

const NavbarWithProps = withRouter(props => <Navbar {...props} />);

const HomeScreen = () => (
    <Bundle load={() => import('./topic/HomeScreen/views')} />
);
const Login = () => (
    <Bundle load={() => import('./topic/Authentication/views/Login')} />
);
const Register = () => (
    <Bundle load={() => import('./topic/Authentication/views/Register')} />
);

const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
    auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
    setAccessToken: access => dispatch(setAccessTokenAction(access)),
    startTokenRefresh: () => dispatch(startTokenRefreshAction()),
});

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
    auth: PropTypes.object.isRequired, // eslint-disable-line
    setAccessToken: PropTypes.func.isRequired,
    startTokenRefresh: PropTypes.func.isRequired,
};

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles)
export default class App extends React.Component {
    static propTypes = propTypes;

    static pages = [
        {
            path: '/login',
            name: pageTitles.login,
            component: Login,
        },
        {
            path: '/register',
            name: pageTitles.register,
            component: Register,
        },
        {
            path: '/',
            name: pageTitles.dashboard,
            component: HomeScreen,
            private: true,
        },
        {
            path: '/:projectId/leads',
            name: pageTitles.leads,
            component: () => <h1>{pageTitles.leads}</h1>,
            private: true,
        },
        {
            path: '/:projectId/entries',
            name: pageTitles.entries,
            component: () => <h1>{pageTitles.entries}</h1>,
            private: true,
        },
        {
            path: '/:projectId/ary',
            name: pageTitles.ary,
            component: () => <h1>{pageTitles.ary}</h1>,
            private: true,
        },
        {
            path: '/:projectId/export',
            name: pageTitles.export,
            component: () => <h1>{pageTitles.export}</h1>,
            private: true,
        },
        {
            path: '/:projectId/leads/:leadId',
            name: pageTitles.editLeads,
            component: () => <h1>{pageTitles.editLeads}</h1>,
            private: true,
        },
        {
            path: '/:projectId/entries/:entryId',
            name: pageTitles.editEntries,
            component: () => <h1>{pageTitles.editEntries}</h1>,
            private: true,
        },
        {
            path: '/users/:userId',
            name: pageTitles.userProfile,
            component: () => <h1>{pageTitles.userProfile}</h1>,
        },
        {
            path: '/countrypanel',
            name: pageTitles.countryPanel,
            component: () => <h1>{pageTitles.countryPanel}</h1>,
        },
    ];

    static loadingMessages = [
        'Locating the required gigapixels to render ...',
        'Spinning up the hamster ...',
        'Shovelling coal into the server ...',
        'Programming the flux capacitor ...',
    ];

    constructor(props) {
        super(props);

        // TODO: rehydrating is very shortlived, so better move this code
        // when a new token is retrieved for the first time
        this.randomMessage = getRandomFromList(App.loadingMessages);
        this.randomMessageStyle = {
            alignItems: 'center',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
        };

        this.state = {
            pending: true,
        };

        const { refresh: refreshToken } = this.props.auth;
        if (!refreshToken) {
            this.state.pending = false;
            return;
        }

        const url = urlForTokenRefresh;
        const paramsFn = () => {
            const { refresh } = this.props.auth;
            return createParamsForTokenRefresh({ refresh });
        };
        this.refreshRequest = new RestBuilder()
            .url(url)
            .params(paramsFn)
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
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
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
    }

    render() {
        if (this.state.pending) {
            // A simple message till the redux store is not rehydrated
            return (
                <div style={this.randomMessageStyle} >
                    { this.randomMessage }
                </div>
            );
        }

        return (
            <div>
                <NavbarWithProps />
                <Switch>
                    {
                        App.pages.map(page => (
                            page.private ? (
                                <PrivateRoute
                                    authenticated={this.props.authenticated}
                                    component={page.component}
                                    exact
                                    key={page.name}
                                    path={page.path}
                                />
                            ) : (
                                <Route
                                    component={page.component}
                                    exact
                                    key={page.name}
                                    path={page.path}
                                />
                            )
                        ))
                    }
                </Switch>
            </div>
        );
    }
}
