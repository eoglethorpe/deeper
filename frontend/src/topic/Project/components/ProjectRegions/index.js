import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    projectDetailsSelector,
} from '../../../../common/redux';

import ProjectRegionDetail from '../ProjectRegionDetail';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectRegions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const { projectDetails } = props;
        let selectedRegion = 0;
        if (projectDetails && projectDetails.regions) {
            selectedRegion = projectDetails.regions[0];
        }

        this.state = {
            selectedRegion,
        };
    }

    handleRegionClick = (regionId) => {
        this.setState({ selectedRegion: regionId });
    }

    renderSelectedRegionDetails = (activeProject, selectedRegion) => {
        console.log(selectedRegion);

        return (
            <ProjectRegionDetail
                key={selectedRegion}
                regionId={selectedRegion}
            />
        );
    }

    render() {
        const {
            activeProject,
            projectDetails,
        } = this.props;

        const { selectedRegion } = this.state;

        return (
            <div styleName="project-regions">
                <div styleName="list-container">
                    {
                        ((projectDetails && projectDetails.regions) || []).map(region => (
                            <button
                                key={region}
                                onClick={() => this.handleRegionClick(region)}
                            >
                                {region}
                            </button>
                        ))
                    }
                </div>
                <div styleName="details-container">
                    {this.renderSelectedRegionDetails(activeProject, selectedRegion)}
                </div>
            </div>
        );
    }
}
