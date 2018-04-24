import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import { reverseRoute } from '../../vendor/react-store/utils/common';

import logo from '../../resources/img/deep-logo.svg';
import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import {
    pathNames,
} from '../../constants';
import {
    activeProjectIdFromStateSelector,
    activeUserSelector,
    currentUserProjectsSelector,
    homescreenStringsSelector,
} from '../../redux';

import styles from './styles.scss';


const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    activeUser: activeUserSelector(state),
    currentUserProjects: currentUserProjectsSelector(state),
    homescreenStrings: homescreenStringsSelector(state),
});

const propTypes = {
    activeProject: PropTypes.number,
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    homescreenStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProject: undefined,
    activeUser: {},
};

@BoundError(AppError)
@connect(mapStateToProps, undefined)
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            currentUserProjects,
            activeProject,
            location,
            activeUser,
        } = this.props;

        if (activeProject && currentUserProjects.length > 0) {
            const params = { projectId: activeProject };
            const routeTo = reverseRoute(pathNames.dashboard, params);
            return (
                <Redirect
                    to={{
                        pathname: routeTo,
                        from: location,
                    }}
                />
            );
        }

        const linkToProfile = reverseRoute(
            pathNames.userProfile,
            { userId: activeUser.userId },
        );

        return (
            <div className={styles.homeScreen}>
                <ReactSVG
                    className={styles.deepLogo}
                    path={logo}
                />
                <p>
                    <span className={styles.welcomeMessage}>
                        {this.props.homescreenStrings('welcomeText')}
                        <strong>{this.props.homescreenStrings('deepLabel')}</strong>
                        <br />
                    </span>
                    {this.props.homescreenStrings('message1')}
                    <br />
                    {this.props.homescreenStrings('message2')}
                    <br />
                </p>
                <Link to={linkToProfile}>
                    {this.props.homescreenStrings('goToProfile')}
                </Link>
            </div>
        );
    }
}
