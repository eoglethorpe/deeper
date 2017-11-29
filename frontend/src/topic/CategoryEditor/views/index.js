import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
} from 'react-router-dom';

import { pageTitles } from '../../../common/utils/labels';
import { setNavbarStateAction } from '../../../common/redux';

import EditCategoryPage from '../components/EditCategoryPage';

import styles from './styles.scss';
import Overview from './Overview';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CategoryEditor extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });
    }

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
