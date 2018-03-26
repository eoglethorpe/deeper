import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
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
import {
    pathNames,
    views,
    routesOrder,
    routes,
} from './constants';

import {
    authenticatedSelector,
    lastNotifySelector,
    notifyHideAction,
} from './redux';

const ROUTE = {
    exclusivelyPublic: 'exclusively-public',
    public: 'public',
    private: 'private',
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

    handleToastClose = () => {
        const { notifyHide } = this.props;
        notifyHide();
    }

    renderRoutes = () => (
        routesOrder.map((routeId) => {
            const view = views[routeId];
            if (!view) {
                console.error(`Cannot find view associated with routeID: ${routeId}`);
                return null;
            }
            const path = pathNames[routeId];
            const { redirectTo, type } = routes[routeId];
            const { authenticated } = this.props;

            switch (type) {
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
                    console.error(`Invalid route type ${type}`);
                    return null;
            }
        })
    )

    render() {
        const { lastNotify } = this.props;

        return (
            <Fragment>
                <Navbar className="navbar" />
                <Toast
                    notification={lastNotify}
                    onClose={this.handleToastClose}
                />
                <div className="deep-main-content">
                    <Switch>
                        { this.renderRoutes() }
                    </Switch>
                </div>
            </Fragment>
        );
    }
}
