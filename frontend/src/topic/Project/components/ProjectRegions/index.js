import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ProjectRegionDetail from '../ProjectRegionDetail';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeProject: undefined,
};

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(null, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectRegions extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            selectedRegion: 1,
        };

        this.projectRegionsList = [
            {
                id: 1,
                title: 'One',
            },
            {
                id: 2,
                title: 'Two',
            },
            {
                id: 3,
                title: 'Three',
            },
            {
                id: 4,
                title: 'Four',
            },
            {
                id: 6,
                title: 'Six',
            },
        ];
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
        console.log();

        return (
            <div styleName="project-regions">
                <div styleName="list-container">
                    {
                        (projectDetails.regions || []).map(region => (
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
