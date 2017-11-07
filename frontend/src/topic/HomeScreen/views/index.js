import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import logo from '../../../img/deep-logo-grey.png';
import { pageTitles } from '../../../common/utils/labels';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    activeUserSelector,
} from '../../../common/selectors/auth';
import {
    activeProjectSelector,
    currentUserProjectsSelector,
} from '../../../common/selectors/domainData';

import styles from './styles.scss';


const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    activeUser: activeUserSelector(state),
    currentUserProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired, // eslint-disable-line
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line
    location: PropTypes.object.isRequired, // eslint-disable-line
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
};

const defaultProps = {
    activeUser: {},
};
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
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
        const {
            currentUserProjects,
            activeProject,
            location,
            activeUser,
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
                <img
                    src={logo}
                    alt="DEEP"
                    draggable="false"
                />
                <p>
                    Welcome to the DEEP
                </p>
                <h2>
                    You have no projects
                </h2>
                <h2>
                    <Link
                        to={`/users/${activeUser.userId}/`}
                    >
                    Go to your profile to create a project
                        <span
                            className="ion-android-person"
                            styleName="icon"
                        />
                    </Link>
                </h2>
                {/*
                    <h2>
                        Download the Chrome Extension
                        <a
                            href="https://deeper.togglecorp.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            <span
                                className="ion-social-chrome"
                                styleName="icon"
                                />
                        </a>
                    </h2>
                */}
            </div>
        );
    }
}
