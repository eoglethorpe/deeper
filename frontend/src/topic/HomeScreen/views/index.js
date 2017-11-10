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

    activeProjectSelector,
    activeUserSelector,
    currentUserProjectsSelector,
} from '../../../common/redux';

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
                <p>
                    Welcome to DEEP
                </p>
                <img
                    src={logo}
                    alt="DEEP"
                    draggable="false"
                />
                <h2>
                    Seems like you have no projects yet.
                </h2>
                <h2>
                    <Link to={`/users/${activeUser.userId}/`} >
                      To get started, go to your profile.
                        <span
                            className="ion-android-person"
                            styleName="icon"
                        />
                    </Link>
                </h2>
            </div>
        );
    }
}
