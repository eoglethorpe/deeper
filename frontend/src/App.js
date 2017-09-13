import React from 'react';
import CSSModules from 'react-css-modules';
import { Switch, Route } from 'react-router-dom';

import Bundle from './Bundle';
import styles from './styles.scss';

const HomeScreen = () => (
    <Bundle load={() => import('./topic/HomeScreen/views')} />
);


class App extends React.Component {
    constructor(props) {
        super(props);

        this.pages = [
            { path: '/', name: 'Home', component: HomeScreen },
        ];
    }

    render() {
        return (
            <div>
                <div>
                    <Switch>
                        {
                            this.pages.map(page => (
                                <Route
                                    exact
                                    key={page.name}
                                    path={page.path}
                                    component={page.component}
                                />
                            ))
                        }
                    </Switch>
                </div>
            </div>
        );
    }
}

export default CSSModules(App, styles);
