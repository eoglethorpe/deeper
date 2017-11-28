import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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

import DocumentView from './DocumentView';
import CategoryView from './CategoryView';


const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired, // eslint-disable-line
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
export default class Overview extends React.PureComponent {
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
        return (
            <div styleName="overview">
                <Helmet>
                    <title>{ pageTitles.categoryEditor }</title>
                </Helmet>
                <DocumentView
                    className="left"
                />
                <CategoryView
                    className="right"
                />
            </div>
        );
    }
}
