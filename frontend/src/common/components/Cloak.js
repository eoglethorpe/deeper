import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    activeUserSelector,
    currentUserProjectsSelector,
} from '../../common/redux';

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
    userProjects: currentUserProjectsSelector(state),
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
    requireProject: PropTypes.bool,
    requireLogin: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    activeUser: {},
    userProjects: [],
    requireProject: false,
    requireLogin: false,
};

@connect(mapStateToProps, undefined)
export default class Navbar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            activeUser,
            userProjects,

            requireProject,
            requireLogin,
            children,
        } = this.props;

        if (requireProject && userProjects.length <= 0) {
            return null;
        } else if (requireLogin && !activeUser.userId) {
            return null;
        }
        return children;
    }
}
