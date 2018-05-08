import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { caseInsensitiveSubmatch, compareString } from '../../../../vendor/react-store/utils/common';
import AccentButton from '../../../../vendor/react-store/components/Action/Button/AccentButton';
import SearchInput from '../../../../vendor/react-store/components/Input/SearchInput';
import RadioInput from '../../../../vendor/react-store/components/Input/RadioInput';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import ListItem from '../../../../vendor/react-store/components/View/List/ListItem';
import Modal from '../../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../vendor/react-store/components/View/Modal/Body';

import { projectDetailsSelector } from '../../../../redux';
import { iconNames } from '../../../../constants';
import _ts from '../../../../ts';
import AddRegion from '../../../../components/AddRegion';

import AddExistingRegion from './AddExistingRegion';
import ProjectRegionDetail from './ProjectRegionDetail';
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
const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
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
                label: _ts('project', 'useExistingRegionText'),
            },
            {
                key: 'new',
                label: _ts('project', 'createNewRegionText'),
            },
        ];

        this.state = {
            displayRegionList: projectDetails.regions || emptyList,
            selectedRegion,
            selectedAddRegionOption: 'old',
            searchInputValue: '',
            showAddRegionModal: false,
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

    getModalClassName = () => {
        const { selectedAddRegionOption } = this.state;
        const classNames = [
            styles.addRegionModal,
        ];

        if (selectedAddRegionOption === 'old') {
            classNames.push(styles.existingRegion);
        }

        return classNames.join(' ');
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
            showAddRegionModal: true,
        });
    }

    handleModalClose = () => {
        this.setState({
            showAddRegionModal: false,
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

    renderRegionListItem = (key, region) => {
        const { selectedRegion } = this.state;
        const isActive = region.id === selectedRegion;

        return (
            <ListItem
                active={isActive}
                key={region.id}
                onClick={() => { this.handleRegionClick(region.id); }}
            >
                {region.title}
            </ListItem>
        );
    }

    renderRegionDetails = ({
        projectDetails = emptyObject,
        selectedRegion,
    }) => {
        if ((projectDetails.regions || emptyList).length > 0) {
            return (
                <div className={styles.regionDetailsContainer}>
                    <ProjectRegionDetail
                        key={selectedRegion}
                        countryId={selectedRegion}
                        projectId={projectDetails.id}
                        onRegionClone={this.handleRegionClone}
                    />
                </div>
            );
        }

        const noRegionText = _ts('project', 'noRegionText');
        return (
            <div className={styles.noRegions}>
                { noRegionText }
            </div>
        );
    }

    renderAddRegionForm = () => {
        const { projectDetails } = this.props;
        const { selectedAddRegionOption } = this.state;

        if (selectedAddRegionOption === 'old') {
            return (
                <AddExistingRegion
                    className={styles.addExistingRegion}
                    projectId={projectDetails.id}
                    onModalClose={this.handleModalClose}
                    onRegionsAdd={this.handleAddedRegions}
                />
            );
        }

        return (
            <AddRegion
                className={styles.addRegion}
                projectId={projectDetails.id}
                onModalClose={this.handleModalClose}
                onRegionAdd={this.handleAddedRegion}
            />
        );
    }

    renderAddRegionModal = () => {
        const {
            showAddRegionModal,
            selectedAddRegionOption,
        } = this.state;

        if (!showAddRegionModal) {
            return null;
        }

        const title = _ts('project', 'addRegionModalTitle');
        const className = this.getModalClassName();
        const AddRegionForm = this.renderAddRegionForm;

        return (
            <Modal className={className}>
                <ModalHeader title={title} />
                <ModalBody className={styles.body}>
                    <RadioInput
                        className={styles.regionTypeInput}
                        name="region-type-input"
                        options={this.addRegionOptions}
                        onChange={this.handleRadioInputChange}
                        value={selectedAddRegionOption}
                    />
                    <AddRegionForm />
                </ModalBody>
            </Modal>
        );
    }

    renderRegionList = () => {
        const {
            displayRegionList,
            searchInputValue,
        } = this.state;

        const sortedRegions = [...displayRegionList]
            .sort((a, b) => compareString(a.title, b.title));

        const searchPlaceholder = _ts('project', 'searchRegionPlaceholder');
        const addRegionButtonLabel = _ts('project', 'addRegionButtonLabel');
        const regionLabel = _ts('project', 'regionLabel');

        return (
            <div className={styles.regionList}>
                <header className={styles.header}>
                    <h4 className={styles.heading}>
                        { regionLabel }
                    </h4>
                    <AccentButton
                        iconName={iconNames.add}
                        className={styles.addRegionButton}
                        onClick={this.handleAddRegionButtonClick}
                    >
                        {addRegionButtonLabel}
                    </AccentButton>
                    <SearchInput
                        className={styles.regionSearchInput}
                        onChange={this.handleSearchInputChange}
                        placeholder={searchPlaceholder}
                        value={searchInputValue}
                        showHintAndError={false}
                        showLabel={false}
                    />
                </header>
                <ListView
                    className={styles.content}
                    modifier={this.renderRegionListItem}
                    data={sortedRegions}
                    keyExtractor={this.calcRegionKey}
                />
            </div>
        );
    }

    render() {
        const { projectDetails } = this.props;
        const { selectedRegion } = this.state;

        const RegionDetails = this.renderRegionDetails;
        const RegionList = this.renderRegionList;
        const AddRegionModal = this.renderAddRegionModal;

        return (
            <div className={styles.projectRegions}>
                <RegionList />
                <RegionDetails
                    projectDetails={projectDetails}
                    selectedRegion={selectedRegion}
                />
                <AddRegionModal />
            </div>
        );
    }
}
