import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import { reverseRoute } from '../../../public/utils/common';

import logo from '../../../img/deep-logo.svg';
import {
    pathNames,
    homescreenStrings,
} from '../../../common/constants';
import {
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

const propTypes = {
    activeProject: PropTypes.number,
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
};

const defaultProps = {
    activeProject: undefined,
    activeUser: {},
};

@connect(mapStateToProps, undefined)
@CSSModules(styles, { allowMultiple: true })
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
            <div styleName="home-screen">
                <ReactSVG
                    styleName="deep-logo"
                    path={logo}
                />
                <p>
                    <span styleName="welcome-message">
                        {homescreenStrings.welcomeText}
                        <strong>{homescreenStrings.deepLabel}</strong>
                        <br />
                    </span>
                    {homescreenStrings.message1}
                    <br />
                    {homescreenStrings.message2}
                    <br />
                </p>
                <Link to={linkToProfile}>
                    {homescreenStrings.goToProfile}
                </Link>
            </div>
        );
    }
}
