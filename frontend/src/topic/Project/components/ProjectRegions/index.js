import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { caseInsensitiveSubmatch, compareString } from '../../../../public/utils/common';
import PrimaryButton from '../../../../public/components/Action/Button/PrimaryButton';
import TextInput from '../../../../public/components/Input/TextInput';
import RadioInput from '../../../../public/components/Input/RadioInput';
import ListItem from '../../../../public/components/View/List/ListItem';
import ListView from '../../../../public/components/View/List/ListView';
import Modal from '../../../../public/components/View/Modal';
import ModalHeader from '../../../../public/components/View/Modal/Header';
import ModalBody from '../../../../public/components/View/Modal/Body';

import {
    projectDetailsSelector,
    projectStringsSelector,
} from '../../../../common/redux';
import { iconNames } from '../../../../common/constants';
import AddRegion from '../../../../common/components/AddRegion';

import AddExistingRegion from '../AddExistingRegion';
import ProjectRegionDetail from '../ProjectRegionDetail';
import styles from './styles.scss';

const propTypes = {
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    projectStrings: projectStringsSelector(state),
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
                label: this.props.projectStrings('useExistingRegionText'),
            },
            {
                key: 'new',
                label: this.props.projectStrings('createNewRegionText'),
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

            let newSelectedRegion = selectedRegion;
            if (regions.findIndex(r => r.id === selectedRegion) === -1) {
                newSelectedRegion = regions.length > 0 ? regions[0].id : selectedRegion;
            }
            this.setState({
                displayRegionList,
                selectedRegion: newSelectedRegion,
            });
        }
    }

    getModalStyleName = () => {
        const { selectedAddRegionOption } = this.state;
        const styleNames = ['add-region-modal'];
        if (selectedAddRegionOption === 'old') {
            styleNames.push('existing-region');
        }
        return styleNames.join(' ');
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

    handleRegionClone = (selectedRegion) => {
        this.setState({ selectedRegion });
    }

    handleAddedRegions = (regions) => {
        if (regions) {
            this.setState({ selectedRegion: regions[0] });
        }
    }

    handleAddedRegion = (region) => {
        this.setState({ selectedRegion: region });
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
                    onRegionClone={this.handleRegionClone}
                />
            );
        }

        return (
            <p styleName="no-regions">
                {this.props.projectStrings('noRegionText')}
            </p>
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
        sortedRegions.sort((a, b) => compareString(a.title, b.title));

        return (
            <div styleName="project-regions">
                <div styleName="list-container">
                    <div styleName="list-header">
                        <TextInput
                            styleName="search-input"
                            onChange={this.handleSearchInputChange}
                            placeholder={this.props.projectStrings('searchRegionPlaceholder')}
                            type="search"
                            value={searchInputValue}
                        />
                        <PrimaryButton
                            iconName={iconNames.add}
                            styleName="add-btn"
                            onClick={this.handleAddRegionButtonClick}
                        >
                            {this.props.projectStrings('addRegionButtonLabel')}
                        </PrimaryButton>
                        { addRegionModal &&
                            <Modal>
                                <ModalHeader title={this.props.projectStrings('addRegionModalTitle')} />
                                <ModalBody styleName={this.getModalStyleName()}>
                                    <RadioInput
                                        styleName="radio-input"
                                        name="addRegionRadioInput"
                                        options={this.addRegionOptions}
                                        onChange={
                                            selectedOption =>
                                                this.handleRadioInputChange(selectedOption)
                                        }
                                        value={selectedAddRegionOption}
                                    />
                                    {selectedAddRegionOption === 'old' &&
                                        <AddExistingRegion
                                            styleName="add-existing-region"
                                            projectId={projectDetails.id}
                                            onModalClose={this.handleModalClose}
                                            onRegionsAdd={this.handleAddedRegions}
                                        />
                                    }
                                    {selectedAddRegionOption === 'new' &&
                                        <AddRegion
                                            styleName="add-region"
                                            projectId={projectDetails.id}
                                            onModalClose={this.handleModalClose}
                                            onRegionAdd={this.handleAddedRegion}
                                        />
                                    }
                                </ModalBody>
                            </Modal>
                        }
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
