import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Bundle from './Bundle';
import Navbar from './common/components/Navbar';
import styles from './styles.scss';
import { pageTitles } from './common/utils/labels';
import PrivateRoute, {
    ExclusivelyPublicRoute,
} from './public/components/PrivateRoute';
import {
    authenticatedSelector,
} from './common/selectors/auth';

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
const Leads = () => (
    <Bundle load={() => import('./topic/Leads/views/')} />
);
const Entries = () => (
    <Bundle load={() => import('./topic/Entries/views')} />
);
const Ary = () => (
    <Bundle load={() => import('./topic/Ary/views')} />
);
const Export = () => (
    <Bundle load={() => import('./topic/Export/views')} />
);

const CountryPanel = () => (
    <Bundle load={() => import('./topic/Country/views')} />
);
const FourHundredFour = () => (
    <Bundle load={() => import('./topic/FourHundredFour/views')} />
);

const NavbarWithProps = withRouter(props => <Navbar {...props} />);

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
    authenticated: authenticatedSelector(state),
});

// NOTE: withRouter is required here so that link change are updated

@withRouter
@connect(mapStateToProps)
@CSSModules(styles)
export default class Multiplexer extends React.PureComponent {
    static propTypes = propTypes;

    static pages = [
        {
            path: '/login/',
            name: pageTitles.login,
            component: Login,
            public: true,
            redirectLink: '/',
        },
        {
            path: '/register/',
            name: pageTitles.register,
            component: Register,
            public: true,
            redirectLink: '/',
        },
        {
            path: '/:projectId/leads/',
            name: pageTitles.leads,
            component: Leads,
            private: true,
        },
        {
            path: '/:projectId/entries/',
            name: pageTitles.entries,
            component: Entries,
            private: true,
        },
        {
            path: '/:projectId/ary/',
            name: pageTitles.ary,
            component: Ary,
            private: true,
        },
        {
            path: '/:projectId/export/',
            name: pageTitles.export,
            component: Export,
            private: true,
        },
        {
            path: '/:projectId/leads/:leadId/',
            name: pageTitles.editLeads,
            component: () => <h1>{pageTitles.editLeads}</h1>,
            private: true,
        },
        {
            path: '/:projectId/entries/:entryId/',
            name: pageTitles.editEntries,
            component: () => <h1>{pageTitles.editEntries}</h1>,
            private: true,
        },
        {
            path: '/users/:userId/',
            name: pageTitles.userProfile,
            component: UserProfile,
            private: true,
        },
        {
            path: '/countrypanel/*',
            name: pageTitles.countryPanel,
            component: CountryPanel,
            private: true,
        },
        {
            path: '/',
            name: pageTitles.dashboard,
            component: HomeScreen,
            private: true,
        },
        {
            path: undefined,
            name: pageTitles.fourHundredFour,
            component: FourHundredFour,
        },
    ];

    componentWillMount() {
        console.log('Mounting Multiplexer');
    }

    componentWillUnmount() {
        console.log('Unmounting Multiplexer');
    }

    renderRoute = (page) => {
        if (page.private) {
            return (
                <PrivateRoute
                    authenticated={this.props.authenticated}
                    component={page.component}
                    exact
                    key={page.name}
                    path={page.path}
                    redirectLink={page.redirectLink}
                />
            );
        } else if (page.public) {
            return (
                <ExclusivelyPublicRoute
                    authenticated={this.props.authenticated}
                    component={page.component}
                    exact
                    key={page.name}
                    path={page.path}
                    redirectLink={page.redirectLink}
                />
            );
        }
        return (
            <Route
                component={page.component}
                exact
                key={page.name}
                path={page.path}
            />
        );
    }

    render() {
        console.log('Rendering Multiplexer');

        return (
            <div>
                <NavbarWithProps />
                <Switch>
                    { Multiplexer.pages.map(this.renderRoute) }
                </Switch>
            </div>
        );
    }
}
