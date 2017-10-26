import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Bundle from './Bundle';
import Navbar from './common/components/Navbar';
import ProjectRouteSynchronizer from './common/components/ProjectRouteSynchronizer';
import { pageTitles } from './common/utils/labels';
import PrivateRoute, {
    ExclusivelyPublicRoute,
} from './public/components/PrivateRoute';
import {
    authenticatedSelector,
} from './common/selectors/auth';

const Leads = () => (
    <ProjectRouteSynchronizer redirectUrl={projectId => `/${projectId}/leads/`} >
        <Bundle load={() => import('./topic/Leads/views/')} />,
    </ProjectRouteSynchronizer>
);

const Entries = () => (
    <ProjectRouteSynchronizer redirectUrl={projectId => `/${projectId}/entries/`} >
        <Bundle load={() => import('./topic/Entries/views/')} />,
    </ProjectRouteSynchronizer>
);

const Ary = () => (
    <ProjectRouteSynchronizer redirectUrl={projectId => `/${projectId}/ary/`} >
        <Bundle load={() => import('./topic/Ary/views/')} />,
    </ProjectRouteSynchronizer>
);

const Export = () => (
    <ProjectRouteSynchronizer redirectUrl={projectId => `/${projectId}/export/`} >
        <Bundle load={() => import('./topic/Export/views/')} />,
    </ProjectRouteSynchronizer>
);

const Dashboard = () => (
    <ProjectRouteSynchronizer redirectUrl={projectId => `/${projectId}/dashboard/`} >
        <Bundle load={() => import('./topic/Dashboard/views')} />
    </ProjectRouteSynchronizer>
);

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

const WeeklySnapshot = () => (
    <Bundle load={() => import('./topic/WeeklySnapshot/views')} />
);
const ProjectPanel = () => (
    <Bundle load={() => import('./topic/Project/views')} />
);
const CountryPanel = () => (
    <Bundle load={() => import('./topic/Country/views')} />
);
const FourHundredFour = () => (
    <Bundle load={() => import('./topic/FourHundredFour/views')} />
);

const AddLead = () => (
    <ProjectRouteSynchronizer redirectUrl={projectId => `/${projectId}/leads/new`} >
        <Bundle load={() => import('./topic/Leads/views/AddLeadView')} />
    </ProjectRouteSynchronizer>
);

const ApiDocs = () => (
    <Bundle load={() => import('./topic/ApiDocs/views')} />
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
            component: AddLead,
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
            path: '/projectpanel/*',
            name: pageTitles.projectPanel,
            component: ProjectPanel,
            private: true,
        },
        {
            path: '/weekly-snapshot/*',
            name: pageTitles.weeklySnapshot,
            component: WeeklySnapshot,
            private: true,
        },
        {
            path: '/api-docs/',
            name: pageTitles.apiDocs,
            component: ApiDocs,
            private: false,
        },

        {
            path: '/:projectId/dashboard/',
            name: pageTitles.dashboard,
            component: Dashboard,
            private: true,
        },

        // NOTE: never add new link below this comment
        {
            path: '/',
            name: pageTitles.homeScreen,
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
                    component={page.component}
                    exact
                    key={page.name}
                    path={page.path}
                    authenticated={this.props.authenticated}
                    redirectLink={page.redirectLink}
                />
            );
        } else if (page.public) {
            return (
                <ExclusivelyPublicRoute
                    component={page.component}
                    exact
                    key={page.name}
                    path={page.path}
                    authenticated={this.props.authenticated}
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

        return ([
            <NavbarWithProps key="navbar" />,
            <Switch key="switch">
                { Multiplexer.pages.map(this.renderRoute) }
            </Switch>,
        ]);
    }
}
