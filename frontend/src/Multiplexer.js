import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Bundle from './Bundle';
import Navbar from './common/components/Navbar';
import PrivateRoute from './public/components/PrivateRoute';
import { pageTitles } from './common/utils/labels';
import styles from './styles.scss';

const HomeScreen = () => (
    <Bundle load={() => import('./topic/HomeScreen/views')} />
);
const Login = () => (
    <Bundle load={() => import('./topic/Authentication/views/Login')} />
);
const Register = () => (
    <Bundle load={() => import('./topic/Authentication/views/Register')} />
);
const UserProfile = () => (
    <Bundle load={() => import('./topic/UserProfile/views/')} />
);

const NavbarWithProps = withRouter(props => <Navbar {...props} />);

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    authenticated: state.auth.authenticated,
});

// NOTE: withRouter is required here so that link change are updated

@withRouter
@connect(mapStateToProps)
@CSSModules(styles)
export default class Multiplexer extends React.PureComponent {
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
            component: UserProfile,
        },
        {
            path: '/countrypanel',
            name: pageTitles.countryPanel,
            component: () => <h1>{pageTitles.countryPanel}</h1>,
        },
    ];

    componentWillMount() {
        console.log('Mounting Multiplexer');
    }

    componentWillUnmount() {
        console.log('Unmounting Multiplexer');
        if (this.refreshRequest) {
            this.refreshRequest.stop();
        }
    }

    render() {
        console.log('Rendering Multiplexer');


        return (
            <div>
                <NavbarWithProps />
                <Switch>
                    {
                        Multiplexer.pages.map(page => (
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
