import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    RadioInput,
    TextInput,
} from '../../../../public/components/Input';
import {
    ListItem,
    ListView,
    Modal,
    ModalHeader,
    ModalBody,
} from '../../../../public/components/View';

import {
    projectDetailsSelector,
} from '../../../../common/redux';

import AddRegion from '../../../../common/components/AddRegion';
import AddExistingRegion from '../AddExistingRegion';
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

const emptyList = [];

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

        this.addRegionOptions = [
            {
                key: 'new',
                label: 'Create new region',
            },
            {
                key: 'old',
                label: 'Use existing region',
            },
        ];

        this.state = {
            displayRegionList: projectDetails.regions || emptyList,
            selectedRegion,
            selectedAddRegionOption: 'new',
            searchInputValue: '',
            addRegionModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps && nextProps.projectDetails.regions) {
            if (nextProps.projectDetails.regions.length > 0) {
                this.setState({ selectedRegion: nextProps.projectDetails.regions[0].id });
            }
            const { searchInputValue } = this.state;
            const caseInsensitiveSubmatch = (region) => {
                if (region.title) {
                    const regionTitle = region.title.toLowerCase();
                    const searchTitle = searchInputValue.toLowerCase();
                    return regionTitle.includes(searchTitle);
                }
                return null;
            };

            const displayRegionList = nextProps.projectDetails.regions.filter(
                caseInsensitiveSubmatch);

            this.setState({ displayRegionList });
        }
    }

    handleRegionClick = (regionId) => {
        this.setState({ selectedRegion: regionId });
    }

    handleSearchInputChange = (value) => {
        const { projectDetails } = this.props;

        const caseInsensitiveSubmatch = region => (
            region.title.toLowerCase().includes(value.toLowerCase())
        );
        const displayRegionList = (projectDetails.regions || emptyList)
            .filter(caseInsensitiveSubmatch);

        this.setState({
            displayRegionList,
            searchInputValue: value,
        });
    };

    handleRadioInputChange = (selectedOption) => {
        this.setState({
            selectedAddRegionOption: selectedOption,
        });
    }

    handleAddRegionButtonClick = () => {
        this.setState({
            addRegionModal: true,
        });
    }

    handleModalClose = () => {
        this.setState({
            addRegionModal: false,
            selectedAddRegionOption: 'new',
        });
    };

    calcRegionKey = region => region.id;

    renderRegionList = (key, region) => {
        const isActive = region.id === this.state.selectedRegion;
        return (
            <ListItem
                active={isActive}
                key={key}
                scrollIntoView={isActive}
            >
                <button
                    className="button"
                    onClick={() => this.handleRegionClick(region.id)}
                >
                    {region.title}
                </button>
            </ListItem>
        );
    }

    renderSelectedRegionDetails = (projectDetails, selectedRegion) => {
        if ((projectDetails.regions || emptyList).length > 0) {
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

        const {
            displayRegionList,
            selectedRegion,
            addRegionModal,
            searchInputValue,
            selectedAddRegionOption,
        } = this.state;

        const sortedRegions = [...displayRegionList];
        sortedRegions.sort((a, b) => (a.title.localeCompare(b.title)));

        return (
            <div styleName="project-regions">
                <div styleName="list-container">
                    <div styleName="list-header">
                        <h2>
                            Regions
                        </h2>
                        <PrimaryButton
                            iconName="ion-plus"
                            onClick={this.handleAddRegionButtonClick}
                        >
                            Add
                        </PrimaryButton>
                        <Modal
                            onClose={this.handleModalClose}
                            show={addRegionModal}
                            closeOnEscape
                        >
                            <ModalHeader title="Add Region" />
                            <ModalBody>
                                <RadioInput
                                    name="addRegionRadioInput"
                                    options={this.addRegionOptions}
                                    onChange={
                                        selectedOption => this.handleRadioInputChange(
                                            selectedOption)
                                    }
                                    selected="new"
                                />
                                {selectedAddRegionOption === 'new' &&
                                    <AddRegion
                                        projectId={projectDetails.id}
                                        onModalClose={this.handleModalClose}
                                    />
                                }
                                {selectedAddRegionOption === 'old' &&
                                    <AddExistingRegion
                                        projectId={projectDetails.id}
                                        onModalClose={this.handleModalClose}
                                    />
                                }
                            </ModalBody>
                        </Modal>
                        <TextInput
                            styleName="search-input"
                            onChange={this.handleSearchInputChange}
                            placeholder="Search Regions"
                            type="search"
                            value={searchInputValue}
                        />
                    </div>
                    <ListView
                        styleName="list"
                        modifier={this.renderRegionList}
                        data={sortedRegions}
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
