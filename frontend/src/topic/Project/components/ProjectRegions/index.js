import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    TransparentButton,
} from '../../../../public/components/Action';
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
        if (projectDetails.regions) {
            selectedRegion = projectDetails.regions[0];
        }

        this.state = {
            selectedRegion,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps && nextProps.projectDetails.regions) {
            this.setState({ selectedRegion: nextProps.projectDetails.regions[0] });
        }
    }

    handleRegionClick = (regionId) => {
        this.setState({ selectedRegion: regionId });
    }

    calcRegionKey = region => region;

    renderRegionList = (key, regionId) => {
        const isActive = regionId === this.state.selectedRegion;
        return (
            <ListItem
                active={isActive}
                key={key}
                scrollIntoView={isActive}
            >
                <TransparentButton
                    className="btn"
                    onClick={() => this.handleRegionClick(regionId)}
                >
                    {regionId}
                </TransparentButton>
            </ListItem>
        );
    }

    renderSelectedRegionDetails = (selectedRegion) => {
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
            projectDetails,
        } = this.props;

        const { selectedRegion } = this.state;

        return (
            <div styleName="project-regions">
                <div styleName="list-container">
                    <ListView
                        styleName="list"
                        modifier={this.renderRegionList}
                        data={projectDetails.regions || []}
                        keyExtractor={this.calcRegionKey}
                    />
                </div>
                <div styleName="details-container">
                    {this.renderSelectedRegionDetails(selectedRegion)}
                </div>
            </div>
        );
    }
}
