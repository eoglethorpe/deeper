import React from 'react';
import CSSModules from 'react-css-modules';
import { Switch, Route } from 'react-router-dom';

import Bundle from './Bundle';
import PrivateRoute from './public/components/PrivateRoute';
import styles from './styles.scss';

const HomeScreen = props => (
    <Bundle load={() => import('./topic/HomeScreen/views')} {...props} />
);
const Login = props => (
    <Bundle load={() => import('./topic/Authentication/views/Login')} {...props} />
);


class App extends React.Component {
    constructor(props) {
        super(props);

        this.pages = [
            {
                path: '/login',
                name: 'Login',
                component: Login,
            },
            {
                path: '/register',
                name: 'Register',
                component: () => <h1>Register</h1>,
            },
            {
                path: '/',
                name: 'Home',
                component: HomeScreen,
                private: true,
                auth: {
                    isAuthenticated: () => false,
                    redirectTo: '/login',
                },
            },
        ];
    }

    render() {
        return (
            <div>
                <div>
                    <Switch>
                        {
                            this.pages.map(page => (
                                page.private ? (
                                    <PrivateRoute
                                        exact
                                        key={page.name}
                                        path={page.path}
                                        component={page.component}
                                        auth={page.auth}
                                    />
                                ) : (
                                    <Route
                                        exact
                                        key={page.name}
                                        path={page.path}
                                        component={page.component}
                                    />
                                )
                            ))
                        }
                    </Switch>
                </div>
            </div>
        );
    }
}

export default CSSModules(App, styles);
