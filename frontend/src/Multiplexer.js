import PropTypes from 'prop-types';
import React from 'react';
import {
    Switch,
    Route,
    withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';

import {
    ExclusivelyPublicRoute,
    PrivateRoute,
} from './public/components/General';

import Navbar from './common/components/Navbar';

import {
    pathNames,
} from './common/constants';

import views from './topic';

import { authenticatedSelector } from './common/selectors/auth';

const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
};

const routesOrder = [
    'login',
    'register',
    'homeScreen',
    'dashboard',
    'projects',
    'countries',
    'leads',
    'entries',
    'ary',
    'userProfile',
    'analysisFramework',
    'categoryEditor',
    'export',
    'editEntries',
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

    homeScreen: { type: ROUTE.private },
    dashboard: { type: ROUTE.private },

    leads: { type: ROUTE.private },
    addLeads: { type: ROUTE.private },

    entries: { type: ROUTE.private },
    editEntries: { type: ROUTE.private },

    ary: { type: ROUTE.private },

    userProfile: { type: ROUTE.private },

    userGroup: { type: ROUTE.private },

    weeklySnapshot: { type: ROUTE.private },

    projects: { type: ROUTE.private },

    countries: { type: ROUTE.private },

    export: { type: ROUTE.private },

    analysisFramework: { type: ROUTE.private },

    categoryEditor: { type: ROUTE.private },

    apiDocs: { type: ROUTE.public },

    fourHundredFour: { type: ROUTE.public },
};

// const NavbarWithProps = withRouter(props => <Navbar {...props} />);

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

    componentWillMount() {
        console.log('Mounting Multiplexer');
    }

    componentWillUnmount() {
        console.log('Unmounting Multiplexer');
    }

    getRoutes = () => (
        routesOrder.map((routeId) => {
            const view = views[routeId];
            const path = pathNames[routeId];

            if (!view) {
                console.error(`Cannot find view associated with routeID: ${routeId}`);
                return null;
            }

            const {
                authenticated,
            } = this.props;

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

    render() {
        console.log('Rendering Multiplexer');

        return ([
            <Navbar key="navbar" />,
            <Switch key="switch">
                { this.getRoutes() }
            </Switch>,
        ]);
    }
}
