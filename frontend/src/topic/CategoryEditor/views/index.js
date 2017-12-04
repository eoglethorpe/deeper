import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import React from 'react';
import {
    Redirect,
    Route,
    HashRouter,
} from 'react-router-dom';

import { pageTitles } from '../../../common/constants';

import EditCategoryPage from '../components/EditCategoryPage';

import styles from './styles.scss';
import Overview from './Overview';

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class CategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <HashRouter>
                <div styleName="category-editor">
                    <Helmet>
                        <title>{ pageTitles.categoryEditor }</title>
                    </Helmet>
                    <Route
                        exact
                        path="/"
                        component={() => (
                            <Redirect to="/overview" />
                        )}
                    />
                    <Route
                        path="/overview"
                        render={props => (
                            <Overview {...props} />
                        )}
                    />
                    <Route
                        path="/edit"
                        render={props => (
                            <EditCategoryPage {...props} />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
