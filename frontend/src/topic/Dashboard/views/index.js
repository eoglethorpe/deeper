import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { pageTitles } from '../../../common/utils/labels';
import {
    setNavbarStateAction,
    currentUserActiveProjectSelector,
} from '../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    currentUserActiveProject: PropTypes.object.isRequired, // eslint-disable-line
    setNavbarState: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Dashboard extends React.PureComponent {
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
                pageTitles.categoryEditor,
                pageTitles.analysisFramework,
            ],
        });
    }

    render() {
        const { currentUserActiveProject } = this.props;
        const projectName = currentUserActiveProject.title;
        return (
            <div styleName="dashboard">
                <Helmet>
                    <title>
                        { pageTitles.dashboard } | { projectName}
                    </title>
                </Helmet>
                <p>
                    Dashboard
                </p>
            </div>
        );
    }
}
