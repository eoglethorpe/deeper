import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import Bundle from './Bundle';
import PrivateRoute from './public/components/PrivateRoute';
import styles from './styles.scss';
import { pageTitles } from './common/utils/labels';

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
});


@connect(mapStateToProps)
@CSSModules(styles)
class App extends React.Component {
    static propTypes = {
        authenticated: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.pages = [
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
        ];
    }

    componentWillMount() {
        console.log('Mounting App');
    }

    render() {
        return (
            <div>
                <Switch>
                    {
                        this.pages.map(page => (
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

export default withRouter(App);
