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
    iconNames,
    projectStrings,
} from '../../../../common/constants';
import { caseInsensitiveSubmatch } from '../../../../public/utils/common';

import {
    projectDetailsSelector,
} from '../../../../common/redux';

import AddRegion from '../../../../common/components/AddRegion';
import AddExistingRegion from '../AddExistingRegion';
import ProjectRegionDetail from '../ProjectRegionDetail';
import styles from './styles.scss';

const propTypes = {
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
                key: 'old',
                label: projectStrings.useExistingRegionText,
            },
            {
                key: 'new',
                label: projectStrings.createNewRegionText,
            },
        ];

        this.state = {
            displayRegionList: projectDetails.regions || emptyList,
            selectedRegion,
            selectedAddRegionOption: 'old',
            searchInputValue: '',
            addRegionModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { projectDetails } = nextProps;
        const {
            searchInputValue,
            selectedRegion,
        } = this.state;

        if (this.props.projectDetails !== projectDetails) {
            const { regions = [] } = projectDetails;
            const displayRegionList = regions.filter(
                region => caseInsensitiveSubmatch(region.title, searchInputValue),
            );

            this.setState({
                displayRegionList,
                selectedRegion: regions.length > 0 ? regions[0].id : selectedRegion,
            });
        }
    }

    handleRegionClick = (regionId) => {
        this.setState({ selectedRegion: regionId });
    }

    handleSearchInputChange = (searchInputValue) => {
        const { projectDetails } = this.props;
        const { regions = [] } = projectDetails;
        const displayRegionList = regions.filter(
            region => caseInsensitiveSubmatch(region.title, searchInputValue),
        );

        this.setState({
            displayRegionList,
            searchInputValue,
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
            selectedAddRegionOption: 'old',
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
                    countryId={selectedRegion}
                />
            );
        }

        return (
            <h1 styleName="no-regions">
                {projectStrings.noRegionText}
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
                        <TextInput
                            styleName="search-input"
                            onChange={this.handleSearchInputChange}
                            placeholder={projectStrings.searchRegionPlaceholder}
                            type="search"
                            value={searchInputValue}
                        />
                        <PrimaryButton
                            iconName={iconNames.add}
                            styleName="add-btn"
                            onClick={this.handleAddRegionButtonClick}
                        >
                            {projectStrings.addRegionButtonLabel}
                        </PrimaryButton>
                        <Modal
                            styleName="add-region-modal"
                            onClose={this.handleModalClose}
                            show={addRegionModal}
                            closeOnEscape
                        >
                            <ModalHeader title={projectStrings.addRegionModalTitle} />
                            <ModalBody>
                                <RadioInput
                                    styleName="radio-input"
                                    name="addRegionRadioInput"
                                    options={this.addRegionOptions}
                                    onChange={
                                        selectedOption => this.handleRadioInputChange(
                                            selectedOption)
                                    }
                                    value="old"
                                />
                                {selectedAddRegionOption === 'old' &&
                                    <AddExistingRegion
                                        styleName="add-existing-region"
                                        projectId={projectDetails.id}
                                        onModalClose={this.handleModalClose}
                                    />
                                }
                                {selectedAddRegionOption === 'new' &&
                                    <AddRegion
                                        styleName="add-region"
                                        projectId={projectDetails.id}
                                        onModalClose={this.handleModalClose}
                                    />
                                }
                            </ModalBody>
                        </Modal>
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
