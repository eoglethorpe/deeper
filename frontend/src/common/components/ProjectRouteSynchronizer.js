import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { isTruthy } from '../../public/utils/common';

import browserHistory from '../browserHistory';
import {
    activeProjectSelector,
    setActiveProjectAction,
} from '../redux';

const propTypes = {
    activeProject: PropTypes.number,
    match: PropTypes.shape({
        params: PropTypes.shape({
            projectId: PropTypes.string,
        }),
    }).isRequired,
    setActiveProject: PropTypes.func.isRequired,
    redirectUrl: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(
            PropTypes.node,
        ),
        PropTypes.node,
    ]).isRequired,
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
});
const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
class ProjectRouteSynchronizer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { activeProject, match } = this.props;
        const projectId = parseInt(match.params.projectId, 10);

        // Initially, set active project from url
        if (isTruthy(projectId) && projectId !== activeProject) {
            // console.info('Setting project to:', projectId);
            this.props.setActiveProject({ activeProject: projectId });
        }
    }

    componentWillMount() {
        console.log('Mounting ProjectRouteSynchronizer');
    }

    componentWillReceiveProps(nextProps) {
        // console.log('RECEIVING PROPS');
        const { match, activeProject } = nextProps;
        const projectId = +match.params.projectId;

        // when route has changed, set state
        if (this.props.match.params.projectId !== nextProps.match.params.projectId) {
            if (isTruthy(projectId) && projectId !== activeProject) {
                // console.info('Setting project to:', projectId);
                this.props.setActiveProject({ activeProject: projectId });
            }
        }
        // when state has changed, set route
        if (this.props.activeProject !== nextProps.activeProject) {
            // set route
            if (isTruthy(activeProject) && projectId !== activeProject) {
                // console.info('Redirecting to:', this.props.redirectUrl(activeProject));
                browserHistory.push(this.props.redirectUrl(activeProject));
            }
        }
    }

    componentWillUnmount() {
        console.log('Unmounting ProjectRouteSynchronizer');
    }

    render() {
        console.log('Rendering ProjectRouteSynchronizer');
        return this.props.children;
    }
}

export default ProjectRouteSynchronizer;
