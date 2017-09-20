import React from 'react';
import CSSModules from 'react-css-modules';
import { Switch, Route } from 'react-router-dom';

import Bundle from './Bundle';
import PrivateRoute from './public/components/PrivateRoute';
import styles from './styles.scss';
import { pageTitles } from './common/utils/labels';

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
                name: pageTitles.login,
                component: Login,
            },
            {
                path: '/register',
                name: pageTitles.register,
                component: () => <h1>{pageTitles.register}</h1>,
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

    render() {
        return (
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
        );
    }
}

export default CSSModules(App, styles);
