import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import React from 'react';
import { connect } from 'react-redux';

import {
    getKeyByValue,
    reverseRoute,
} from '../../public/utils/common';

import {
    pathNames,
    pageTitles,
} from '../../common/constants';

import browserHistory from '../browserHistory';
import {
    activeProjectSelector,
    setActiveProjectAction,
} from '../redux';

const propTypes = {
    match: PropTypes.shape({
        location: PropTypes.string,
        params: PropTypes.shape({
            dummy: PropTypes.string,
        }),
    }).isRequired,

    activeProject: PropTypes.number,

    component: PropTypes.func.isRequired,
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

@connect(mapStateToProps, mapDispatchToProps)
class RouteSynchronizer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.synchronizeLocation(props);
    }

    componentWillMount() {
        console.log('Mounting ProjectRouteSynchronizer');
    }

    componentWillReceiveProps(nextProps) {
        const {
            match,
            activeProject: projectId,
            // activeCountry: countryId,
        } = nextProps;

        const newParams = { ...match.params };
        let changed = false;

        if (match.params.projectId && projectId !== +match.params.projectId) {
            newParams.projectId = projectId;
            changed = true;
        }

        /*
        if (countryId !== match.params.countryId) {
            newParams.projectId = projectId;
            changed = true;
        }
        */

        if (changed) {
            browserHistory.push(reverseRoute(match.path, newParams));
        } else {
            this.synchronizeLocation(nextProps);
        }
    }

    componentWillUnmount() {
        console.log('Unmounting ProjectRouteSynchronizer');
    }

    synchronizeLocation = (newProps) => {
        const {
            match: oldMatch,
            activeProject: oldActiveProject,
        } = this.props;

        const {
            match: newMatch,
        } = newProps;

        if (!newMatch.params.projectId) {
            return;
        }

        const oldParams = {
            ...oldMatch.params,
            projectId: oldActiveProject,
        };

        const oldLocation = reverseRoute(newMatch.path, oldParams);

        if (oldLocation !== newMatch.url) {
            newProps.setActiveProject({
                activeProject: +newMatch.params.projectId,
            });
        }
    }

    render() {
        const {
            component: Component,
            match,
            ...otherProps
        } = this.props;

        const title = pageTitles[getKeyByValue(pathNames, match.path)];

        return [
            <Helmet key={title}>
                <meta charSet="utf-8" />
                <title>
                    { title }
                </title>
            </Helmet>,
            <Component
                key="component"
                match={match}
                {...otherProps}
            />,
        ];
    }
}

export default RouteSynchronizer;
