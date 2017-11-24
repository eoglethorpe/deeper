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
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    currentAnalysisFrameworkSelector,
} from '../../../common/selectors/domainData';

import styles from './styles.scss';

import Overview from './Overview';
import List from './List';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    analysisFramework: PropTypes.object.isRequired,    // eslint-disable-line
};

const mapStateToProps = (state, props) => ({
    analysisFramework: currentAnalysisFrameworkSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;

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
        const { analysisFramework } = this.props;

        return (
            <HashRouter>
                <div styleName="analysis-framework">
                    <Helmet>
                        <title>{ pageTitles.analysisFramework }</title>
                    </Helmet>
                    <Route
                        exact
                        path="/"
                        component={
                            () => (
                                <Redirect to="/overview" />
                            )
                        }
                    />
                    <Route
                        path="/overview"
                        render={props => (
                            <Overview
                                {...props}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                    <Route
                        path="/list"
                        render={props => (
                            <List
                                {...props}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
