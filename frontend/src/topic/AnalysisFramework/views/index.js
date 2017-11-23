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
    currentUserProjectsSelector,
} from '../../../common/selectors/domainData';

import {
    activeProjectSelector,
} from '../../../common/selectors/siloDomainData';

import styles from './styles.scss';

import widgetStore from '../widgetStore';
import Overview from './Overview';
import List from './List';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired, // eslint-disable-line
    // boundingClientRect: PropTypes.shape({
    //     width: PropTypes.number,
    //     height: PropTypes.number,
    // }).isRequired,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    currentUserProjects: currentUserProjectsSelector(state),
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
        const OverviewWrapper = props => (
            <Overview
                widgets={
                    widgetStore.filter(widget => widget.analysisFramework.overviewComponent)
                        .map(widget => ({
                            id: widget.id,
                            title: widget.title,
                            component: <widget.analysisFramework.overviewComponent />,
                        }))
                }
                {...props}
            />
        );
        const ListWrapper = props => (
            <List
                widgets={
                    widgetStore.filter(widget => widget.analysisFramework.listComponent)
                        .map(widget => ({
                            id: widget.id,
                            title: widget.title,
                            component: <widget.analysisFramework.listComponent />,
                        }))
                }
                {...props}
            />
        );

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
                    <Route path="/overview" component={OverviewWrapper} />
                    <Route path="/list" component={ListWrapper} />
                </div>
            </HashRouter>
        );
    }
}
