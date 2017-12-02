import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
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
    'dashboard',
    'projects',
    'countries',
    'leads',
    'entries',
    'ary',
    'analysisFramework',
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

    homeScreen: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },
    dashboard: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    leads: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },
    addLeads: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    entries: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },
    editEntries: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    ary: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    userProfile: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    userGroup: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    weeklySnapshot: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    projects: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    countries: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    export: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    analysisFramework: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    categoryEditor: {
        type: ROUTE.private,
        redirectTo: pathNames.login,
    },

    apiDocs: {
        type: ROUTE.public,
    },

    fourHundredFour: {
        type: ROUTE.public,
    },
};

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

            console.log(routeId, path);
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

        // NOTE: List component cannot be used here instead of map
        return ([
            <NavbarWithProps key="navbar" />,
            <Switch key="switch">
                { this.getRoutes() }
            </Switch>,
        ]);
    }
}
