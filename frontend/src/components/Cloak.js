import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    activeUserSelector,
    currentUserProjectsSelector,
    activeProjectFromStateSelector,
} from '../redux';

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
    userProjects: currentUserProjectsSelector(state),
    currentUserActiveProject: activeProjectFromStateSelector(state),
});

const propTypes = {
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
    requireAdminRights: PropTypes.bool,
    requireProject: PropTypes.bool,
    requireLogin: PropTypes.bool,
    requireDevMode: PropTypes.bool,
    requireAssessmentTemplate: PropTypes.bool,
    render: PropTypes.func.isRequired,
};

const defaultProps = {
    activeUser: {},
    userProjects: [],
    requireAdminRights: false,
    requireProject: false,
    requireLogin: false,
    requireDevMode: false,
    requireAssessmentTemplate: false,
};

@connect(mapStateToProps, undefined)
export default class Cloak extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            activeUser,
            userProjects,
            currentUserActiveProject,

            requireAdminRights,
            requireProject,
            requireLogin,
            requireDevMode,
            requireAssessmentTemplate,
            render,
        } = this.props;


        if (requireDevMode && process.env.NODE_ENV !== 'development') {
            return null;
        } if (requireProject && userProjects.length <= 0) {
            return null;
        } else if (requireLogin && !activeUser.userId) {
            return null;
        } else if (requireAdminRights && !activeUser.isSuperuser) {
            return null;
        } else if (requireAssessmentTemplate && !currentUserActiveProject.assessmentTemplate) {
            return null;
        }
        return render();
    }
}
