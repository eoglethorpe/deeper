import PropTypes from 'prop-types';
import React from 'react';
import {
    Switch,
    Route,
    withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';

import ExclusivelyPublicRoute from './vendor/react-store/components/General/ExclusivelyPublicRoute';
import PrivateRoute from './vendor/react-store/components/General/PrivateRoute';
import Toast from './vendor/react-store/components/View/Toast';

import Navbar from './components/Navbar';
import { pathNames } from './constants';
import {
    authenticatedSelector,
    lastNotifySelector,
    notifyHideAction,
} from './redux';

import views from './views';

const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

const routesOrder = [
    // NOTE: Do not remove the immediate line
    // 'adminPanel', pageTitleStrings('adminPanel');
    'login', // pageTitleStrings('login');
    'register', // pageTitleStrings('register');
    'passwordReset', // pageTitleStrings('passwordReset');
    'browserExtension', // pageTitleStrings('browserExtension');
    'projects', // pageTitleStrings('projects');
    'dashboard', // pageTitleStrings('dashboard');
    'leads', // pageTitleStrings('leads');
    'leadsViz', // pageTitleStrings('leadsViz');
    'addLeads', // pageTitleStrings('addLeads');
    'entries', // pageTitleStrings('entries');
    'editEntries', // pageTitleStrings('editEntries');
    'arys', // pageTitleStrings('arys');
    'editAry', // pageTitleStrings('editAry');
    'export', // pageTitleStrings('export');
    'userExports', // pageTitleStrings('userExports');
    'countries', // pageTitleStrings('countries');
    'userProfile', // pageTitleStrings('userProfile');
    'userGroup', // pageTitleStrings('userGroup');
    'analysisFramework', // pageTitleStrings('analysisFramework');
    'categoryEditor', // pageTitleStrings('categoryEditor');
    'weeklySnapshot', // pageTitleStrings('weeklySnapshot');
    'apiDocs', // pageTitleStrings('apiDocs');
    'homeScreen', // pageTitleStrings('homeScreen');
    'stringManagement', // pageTitleStrings('stringManagement');
    'fourHundredFour', // pageTitleStrings('fourHundredFour');
];

const routes = {
    login: {
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
    },
    register: {
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
    },
    passwordReset: {
        type: ROUTE.exclusivelyPublic,
        redirectTo: '/',
    },

    homeScreen: { type: ROUTE.private },
    dashboard: { type: ROUTE.private },
    leads: { type: ROUTE.private },
    leadsViz: { type: ROUTE.private },
    addLeads: { type: ROUTE.private },
    entries: { type: ROUTE.private },
    editEntries: { type: ROUTE.private },
    arys: { type: ROUTE.private },
    editAry: { type: ROUTE.private },
    userProfile: { type: ROUTE.private },
    userGroup: { type: ROUTE.private },
    weeklySnapshot: { type: ROUTE.private },
    projects: { type: ROUTE.private },
    countries: { type: ROUTE.private },
    export: { type: ROUTE.private },
    userExports: { type: ROUTE.private },
    analysisFramework: { type: ROUTE.private },
    categoryEditor: { type: ROUTE.private },
    apiDocs: { type: ROUTE.private },
    browserExtension: { type: ROUTE.private },
    fourHundredFour: { type: ROUTE.public },
    stringManagement: { type: ROUTE.private },
};

const propTypes = {
    authenticated: PropTypes.bool.isRequired,
    lastNotify: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    notifyHide: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    authenticated: authenticatedSelector(state),
    lastNotify: lastNotifySelector(state),
});

const mapDispatchToProps = dispatch => ({
    notifyHide: params => dispatch(notifyHideAction(params)),
});

// NOTE: withRouter is required here so that link change are updated

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
export default class Multiplexer extends React.PureComponent {
    static propTypes = propTypes;

    getRoutes = () => (
        routesOrder.map((routeId) => {
            const view = views[routeId];
            const path = pathNames[routeId];

            if (!view) {
                console.error(`Cannot find view associated with routeID: ${routeId}`);
                return null;
            }

            const { authenticated } = this.props;

            const redirectTo = routes[routeId].redirectTo;

            switch (routes[routeId].type) {
                case ROUTE.exclusivelyPublic:
                    return (
                        <ExclusivelyPublicRoute
                            component={view}
                            key={routeId}
                            path={path}
                            authenticated={authenticated}
                            redirectLink={redirectTo}
                            exact
                        />
                    );
                case ROUTE.private:
                    return (
                        <PrivateRoute
                            component={view}
                            key={routeId}
                            path={path}
                            authenticated={authenticated}
                            redirectLink={redirectTo}
                            exact
                        />
                    );
                case ROUTE.public:
                    return (
                        <Route
                            component={view}
                            key={routeId}
                            path={path}
                            exact
                        />
                    );
                default:
                    console.error(`Invalid route type ${routes[routeId].type}`);
                    return null;
            }
        })
    )

    handleToastClose = () => {
        const { notifyHide } = this.props;
        notifyHide();
    }

    render() {
        const { lastNotify } = this.props;

        return ([
            <Navbar
                key="navbar"
                className="navbar"
            />,
            <Toast
                notification={lastNotify}
                key="toast"
                onClose={this.handleToastClose}
            />,
            <div
                className="deep-main-content"
                key="main"
            >
                <Switch>
                    { this.getRoutes() }
                </Switch>
            </div>,
        ]);
    }
}
