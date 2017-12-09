import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import { reverseRoute } from '../../../public/utils/common';

import logo from '../../../img/deep-logo-grey.png';
import {
    pathNames,
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

        if (currentUserProjects.length > 0) {
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

        return (
            <div styleName="home-screen">
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
                    <Link
                        to={reverseRoute(pathNames.userProfile, { userId: activeUser.userId })}
                    >
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
