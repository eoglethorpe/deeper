import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import React from 'react';
import { connect } from 'react-redux';

import {
    Bundle,
} from '../../public/components/General';
import {
    getKeyByValue,
    reverseRoute,
} from '../../public/utils/common';

import {
    pathNames,
    pageTitles,
} from '../../common/constants';

import {
    activeProjectSelector,
    activeCountrySelector,
    setActiveProjectAction,
    setActiveCountryAction,
    setRouteParamsAction,
} from '../redux';

const propTypes = {
    match: PropTypes.shape({
        location: PropTypes.string,
        params: PropTypes.shape({
            dummy: PropTypes.string,
        }),
    }).isRequired,

    history: PropTypes.shape({
        push: PropTypes.func,
    }).isRequired,

    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,

    activeProjectId: PropTypes.number,
    activeCountryId: PropTypes.number,
    setRouteParams: PropTypes.func.isRequired,
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
    setRouteParams: params => dispatch(setRouteParamsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
class RouteSynchronizer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.syncState(props);

        this.props.setRouteParams(props.match);
    }

    componentWillMount() {
        console.log('Mounting ProjectRouteSynchronizer');
    }

    componentWillReceiveProps(nextProps) {
        const newUrlParams = this.getNewUrlParams(nextProps);
        if (this.props.match !== nextProps.match) {
            this.props.setRouteParams(nextProps.match);
        }

        if (newUrlParams) {
            console.log('Syncing url');
            this.syncUrl(nextProps, newUrlParams);
        } else {
            console.log('Syncing state');
            this.syncState(nextProps);
        }
    }

    componentWillUnmount() {
        console.log('Unmounting ProjectRouteSynchronizer');
    }

    getNewUrlParams = (nextProps) => {
        const {
            activeProjectId: oldProjectId,
            activeCountryId: oldCountryId,
        } = this.props;
        const {
            match: { params },
            activeProjectId: newProjectId,
            activeCountryId: newCountryId,
        } = nextProps;
        const {
            projectId,
            countryId,
        } = params;

        const changed = (
            (projectId && oldProjectId !== newProjectId) ||
            (countryId && oldCountryId !== newCountryId)
        );

        if (!changed) {
            return undefined;
        }
        return {
            ...params,
            projectId: newProjectId,
            countryId: newCountryId,
        };
    };

    syncUrl = (nextProps, newUrlParams) => {
        const { history, match: { path } } = nextProps;
        const { location } = this.props;
        history.push({
            ...location,
            pathname: reverseRoute(path, newUrlParams),
        });
    }

    syncState = (newProps) => {
        const {
            activeProjectId: oldActiveProjectId,
            activeCountryId: oldActiveCountryId,
            match: { params: oldMatchParams },
        } = this.props;

        const {
            match: {
                path: newMatchPath,
                url: newMatchUrl,
                projectId: newMatchProjectId,
                countryId: newMatchCountryId,
            },
        } = newProps;

        const oldLocation = reverseRoute(
            newMatchPath,
            {
                ...oldMatchParams,
                projectId: oldActiveProjectId,
                countryId: oldActiveCountryId,
            },
        );
        if (oldLocation === newMatchUrl) {
            return;
        }

        if (newMatchProjectId && oldActiveProjectId !== +newMatchProjectId) {
            newProps.setActiveProject({ activeProject: +newMatchProjectId });
        }
        if (newMatchCountryId && oldActiveCountryId !== +newMatchCountryId) {
            newProps.setActiveCountry({ activeCountry: +newMatchCountryId });
        }
    }

    render() {
        const {
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
            <Bundle
                key="component"
                {...otherProps}
            />,
        ];
    }
}

export default RouteSynchronizer;
