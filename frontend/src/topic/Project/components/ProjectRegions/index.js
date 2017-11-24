import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    PrimaryButton,
    TransparentButton,
} from '../../../../public/components/Action';
import {
    TextInput,
} from '../../../../public/components/Input';
import {
    ListItem,
    ListView,
} from '../../../../public/components/View';

import {
    projectDetailsSelector,
} from '../../../../common/redux';

import ProjectRegionDetail from '../ProjectRegionDetail';
import styles from './styles.scss';

const propTypes = {
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
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
        if (projectDetails.regions && projectDetails.regions.length > 0) {
            selectedRegion = projectDetails.regions[0].id;
        }

        this.state = {
            selectedRegion,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps && nextProps.projectDetails.regions) {
            if (nextProps.projectDetails.regions.length > 0) {
                this.setState({ selectedRegion: nextProps.projectDetails.regions[0].id });
            }
        }
    }

    handleRegionClick = (regionId) => {
        this.setState({ selectedRegion: regionId });
    }

    calcRegionKey = region => region.id;

    renderRegionList = (key, region) => {
        const isActive = region.id === this.state.selectedRegion;
        return (
            <ListItem
                active={isActive}
                key={key}
                scrollIntoView={isActive}
            >
                <TransparentButton
                    className="btn"
                    onClick={() => this.handleRegionClick(region.id)}
                >
                    {region.title}{region.id}
                </TransparentButton>
            </ListItem>
        );
    }

    renderSelectedRegionDetails = (projectDetails, selectedRegion) => {
        if ((projectDetails.regions || []).length > 0) {
            return (
                <ProjectRegionDetail
                    key={selectedRegion}
                    regionId={selectedRegion}
                />
            );
        }

        return (
            <h1 styleName="no-regions">
                There are no regions in this project.
            </h1>
        );
    }

    render() {
        const {
            projectDetails,
        } = this.props;

        const { selectedRegion } = this.state;

        return (
            <div styleName="project-regions">
                <div styleName="list-container">
                    <div styleName="list-header">
                        <h1 styleName="header-text">
                            Regions
                        </h1>
                        <PrimaryButton
                            iconName="ion-plus"
                            onClick={this.onAddRegion}
                        >
                            Add Region
                        </PrimaryButton>
                        <TextInput
                            styleName="search-input"
                            onChange={this.search}
                            placeholder="Search Regions"
                            type="search"
                            value={this.state.searchInputValue}
                        />
                    </div>
                    <ListView
                        styleName="list"
                        modifier={this.renderRegionList}
                        data={projectDetails.regions || []}
                        keyExtractor={this.calcRegionKey}
                    />
                </div>
                <div styleName="details-container">
                    {this.renderSelectedRegionDetails(projectDetails, selectedRegion)}
                </div>
            </div>
        );
    }
}
