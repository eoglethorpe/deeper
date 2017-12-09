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
    activeCountrySelector,
    setActiveProjectAction,
    setActiveCountryAction,
} from '../redux';

const propTypes = {
    match: PropTypes.shape({
        location: PropTypes.string,
        params: PropTypes.shape({
            dummy: PropTypes.string,
        }),
    }).isRequired,

    activeProjectId: PropTypes.number,

    activeCountryId: PropTypes.number,

    component: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProjectId: undefined,
    activeCountryId: undefined,
};

const mapStateToProps = state => ({
    activeProjectId: activeProjectSelector(state),
    activeCountryId: activeCountrySelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    setActiveCountry: params => dispatch(setActiveCountryAction(params)),
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
            activeProjectId: newProjectId,
            activeCountryId: newCountryId,
        } = nextProps;

        const {
            activeProjectId: oldProjectId,
            activeCountryId: oldCountryId,
        } = this.props;

        const {
            projectId,
            countryId,
        } = match.params;

        const newParams = { ...match.params };
        let changed = false;

        if (projectId && oldProjectId !== newProjectId) {
            newParams.projectId = newProjectId;
            changed = true;
        }

        if (countryId && oldCountryId !== newCountryId) {
            newParams.countryId = countryId;
            changed = true;
        }

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
            activeProjectId: oldActiveProjectId,
            activeCountryId: oldActiveCountryId,
        } = this.props;

        const {
            match: newMatch,
        } = newProps;

        const oldParams = {
            ...oldMatch.params,
            projectId: oldActiveProjectId,
            countryId: oldActiveCountryId,
        };

        const oldLocation = reverseRoute(newMatch.path, oldParams);

        if (oldLocation !== newMatch.url) {
            if (newMatch.params.projectId && oldActiveProjectId !== +newMatch.params.projectId) {
                newProps.setActiveProject({
                    activeProject: +newMatch.params.projectId,
                });
            }

            if (newMatch.params.countryId && oldActiveCountryId !== +newMatch.params.countryId) {
                newProps.setActiveCountry({
                    activeCountry: +newMatch.params.countryId,
                });
            }
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