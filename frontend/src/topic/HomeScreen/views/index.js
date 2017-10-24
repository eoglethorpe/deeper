import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { pageTitles } from '../../../common/utils/labels';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    activeProjectSelector,
    currentUserProjectsSelector,
} from '../../../common/selectors/domainData';

import styles from './styles.scss';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired, // eslint-disable-line
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line
    location: PropTypes.object.isRequired, // eslint-disable-line
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
export default class HomeScreen extends React.PureComponent {
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
        const {
            currentUserProjects,
            activeProject,
            location,
        } = this.props;
        if (currentUserProjects.length > 0) {
            return (
                <Redirect
                    to={{
                        pathname: `/${activeProject}/dashboard/`,
                        from: location,
                    }}
                />
            );
        }

        return (
            <div styleName="home-screen">
                <Helmet>
                    <title>{ pageTitles.homeScreen }</title>
                </Helmet>
                <p>
                    Home Screen
                </p>
            </div>
        );
    }
}
