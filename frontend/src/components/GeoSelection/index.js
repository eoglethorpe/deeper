import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../vendor/react-store/utils/immutable-update';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../vendor/react-store/components/View/Modal/Footer';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import MultiSelectInput from '../../vendor/react-store/components/Input/MultiSelectInput';
import Button from '../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import Input from '../../vendor/react-store/utils/input';

import WidgetEmptyComponent from '../WidgetEmptyComponent';
import { entryStringsSelector } from '../../redux';

import { iconNames } from '../../constants';
import RegionMap from '../RegionMap';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    disabled: PropTypes.bool.isRequired,
    hideList: PropTypes.bool,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    geoOptions: {},
    label: '',
    hideList: false,
    onChange: undefined,
    value: [],
};

const emptyList = [];
const emptyObject = {};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
});

@Input
@connect(mapStateToProps)
export default class GeoSelection extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static adminLevelKeySelector = d => d.title;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createFlatLocations = locations => (
        Object.values(locations)
            .reduce(
                (acc, value) => (
                    acc.concat(value)
                ),
                [],
            )
    )

    static createNonFlatValues = (locations, flatValues) => {
        const values = {};
        Object.keys(locations)
            .forEach((regionId) => {
                values[regionId] = flatValues.filter(
                    v => locations[regionId].find(l => l.key === v),
                );
            });
        return values;
    }

    static createFlatValues = values => (
        Object.values(values)
            .reduce(
                (acc, value) => acc.concat(value),
                [],
            )
    )

    constructor(props) {
        super(props);
        const locations = props.geoOptions;
        const flatLocations = GeoSelection.createFlatLocations(locations);

        const flatValues = props.value || emptyList;
        const values = GeoSelection.createNonFlatValues(locations, flatValues);

        let selectedRegion;

        if (props.regions) {
            selectedRegion = (props.regions[0] || emptyObject).id;
        }

        this.state = {
            showMapModal: false,
            selectedRegion,
            locations,
            flatLocations,
            values,
            flatValues,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { geoOptions, value } = nextProps;

        if (geoOptions !== this.props.geoOptions) {
            const locations = geoOptions;
            const flatLocations = GeoSelection.createFlatLocations(locations);

            const flatValues = value || emptyList;
            const values = GeoSelection.createNonFlatValues(locations, flatValues);

            this.setState({
                values,
                locations,
                flatValues,
                flatLocations,
            });
        } else if (value !== this.props.value) {
            const { locations } = this.state;
            const flatValues = value || emptyList;
            const values = GeoSelection.createNonFlatValues(locations, flatValues);

            this.setState({
                values,
                flatValues,
            });
        }
    }

    handleRegionSelection = (selectedRegion) => {
        this.setState({ selectedRegion });
    }

    handleMapSelect = (val) => {
        const { values, selectedRegion } = this.state;
        const settings = {
            [selectedRegion]: { $autoArray: {
                $set: val,
            } },
        };
        const newValues = update(values, settings);
        this.setState(
            { values: newValues },
            this.updateFlatValues,
        );
    }

    updateFlatValues = () => {
        const { values = {} } = this.state;
        const flatValues = GeoSelection.createFlatValues(values);
        this.setState({ flatValues });
    }

    handleLocationSelection = (val) => {
        const { values, selectedRegion } = this.state;
        const settings = {
            [selectedRegion]: { $autoArray: {
                $set: val,
            } },
        };
        const newValues = update(values, settings);
        this.setState(
            { values: newValues },
            this.updateFlatValues,
        );
    }

    handleGeoSelectButtonClick = () => {
        this.setState({ showMapModal: true });
    }

    handleMapModalClose = () => {
        this.setState({ showMapModal: false });
    }

    handleModalSetButtonClick = () => {
        const { flatValues, flatLocations } = this.state;
        const flatValuesWithTitle = flatValues.map(v => (
            flatLocations.find(l => l.key === v)
        ));
        if (this.props.onChange) {
            this.props.onChange(flatValues, flatValuesWithTitle);
        }
        this.setState({ showMapModal: false });
    }

    handleModalCancelButtonClick = () => {
        const locations = this.props.geoOptions;
        const flatValues = this.props.value || emptyList;
        const values = GeoSelection.createNonFlatValues(locations, flatValues);

        this.setState(
            {
                values,
                showMapModal: false,
            },
            this.updateFlatValues,
        );
    }

    handleRegionRemove = (key) => {
        const { selectedRegion, values } = this.state;

        const settings = {
            [selectedRegion]: { $autoArray: {
                $filter: d => d !== key,
            } },
        };
        const newValues = update(values, settings);
        this.setState(
            { values: newValues },
            this.updateFlatValues,
        );
    }

    handleFlatSelectChange = (newFlatValues) => {
        const { flatLocations } = this.state;
        const flatValuesWithTitle = newFlatValues.map(v => (
            flatLocations.find(l => l.key === v)
        ));
        if (this.props.onChange) {
            this.props.onChange(newFlatValues, flatValuesWithTitle);
        }

        const { locations } = this.state;
        const values = GeoSelection.createNonFlatValues(locations, newFlatValues);
        this.setState(
            { values },
            this.updateFlatValues,
        );
    }

    regionKeySelector = d => d.id;

    regionLabelSelector = d => d.title;

    renderSelectedList = (key, data) => (
        <div
            className={styles.regionItem}
            key={key}
        >
            {data.label}
            <DangerButton
                onClick={() => this.handleRegionRemove(key)}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    )

    renderAdminLevelList = (key, data) => (
        <div
            className={styles.adminLevelSection}
            key={key}
        >
            <span
                className={styles.title}
            >
                {data.title}
            </span>
            <ListView
                data={data.values}
                keyExtractor={GeoSelection.valueKeyExtractor}
                modifier={this.renderSelectedList}
            />
        </div>
    )

    renderList = (key, data) => {
        const marker = '•';

        return (
            <div
                key={key}
                className={styles.regionName}
            >
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    { data.label }
                </div>
            </div>
        );
    }

    render() {
        const {
            className,
            label,
            disabled,
            regions,
            hideList,
        } = this.props;

        const {
            showMapModal,
            selectedRegion,
            values = {},
            flatValues,
            locations,
            flatLocations = emptyList,
        } = this.state;

        // FIXME: move this to componentWillUpdate
        const selectedRegionMap = {};
        const valuesForSelectedRegion = values[selectedRegion] || emptyList;
        valuesForSelectedRegion.forEach((key) => {
            // FIXME: slow
            const regionData = flatLocations.find(l => l.key === key);
            if (!regionData) {
                return;
            }

            const { adminLevelTitle } = regionData;

            if (!selectedRegionMap[adminLevelTitle]) {
                const newRegion = {
                    title: adminLevelTitle,
                    values: [regionData],
                };
                selectedRegionMap[adminLevelTitle] = newRegion;
            } else {
                selectedRegionMap[adminLevelTitle].values.push(regionData);
            }
        });
        const selectedRegionList = Object.values(selectedRegionMap);

        // FIXME: move this to componentWillUpdate
        // FIXME: slow
        const flatValuesWithTitle = flatValues
            .map(v => flatLocations.find(l => l.key === v))
            .filter(v => v);

        return (
            <div className={`${className} ${styles.geoSelection}`}>
                <div className={styles.header}>
                    <MultiSelectInput
                        className={`flat-select-input ${styles.flatSelectInput}`}
                        label={label}
                        showHintAndError={false}
                        hideSelectAllButton
                        onChange={this.handleFlatSelectChange}
                        options={flatLocations}
                        value={flatValues}
                        disabled={disabled}
                    />
                    <AccentButton
                        className={styles.mapModalButton}
                        onClick={this.handleGeoSelectButtonClick}
                        smallVerticalPadding
                        smallHorizontalPadding
                        transparent
                        disabled={disabled}
                    >
                        <span className={iconNames.globe} />
                    </AccentButton>
                </div>
                { showMapModal &&
                    <Modal
                        className={styles.modal}
                        onClose={this.handleMapModalClose}
                        closeOnEscape
                    >
                        <ModalHeader
                            title="Geo selection"
                            rightComponent={
                                <div className={styles.locationSelects} >
                                    <SelectInput
                                        hideClearButton
                                        keySelector={this.regionKeySelector}
                                        label={this.props.entryStrings('regionSelectTitle')}
                                        labelSelector={this.regionLabelSelector}
                                        onChange={this.handleRegionSelection}
                                        options={regions}
                                        optionsIdentifier="region-select-options"
                                        placeholder={this.props.entryStrings('regionSelectPlaceholder')}
                                        showHintAndError={false}
                                        value={selectedRegion}
                                    />
                                    <MultiSelectInput
                                        label={this.props.entryStrings('locationSelectTitle')}
                                        onChange={this.handleLocationSelection}
                                        options={locations[selectedRegion]}
                                        optionsIdentifier="location-select-options"
                                        placeholder={this.props.entryStrings('locationSelectPlaceholder')}
                                        showHintAndError={false}
                                        className={styles.mapSelectionSelect}
                                        value={values[selectedRegion]}
                                    />
                                </div>
                            }
                        />
                        <ModalBody className={styles.body}>
                            <RegionMap
                                className={styles.map}
                                regionId={selectedRegion}
                                onChange={this.handleMapSelect}
                                selections={values[selectedRegion]}
                            />
                            <div className={styles.mapSelections} >
                                <ListView
                                    className={styles.mapSelectionsList}
                                    data={selectedRegionList}
                                    keyExtractor={GeoSelection.adminLevelKeySelector}
                                    modifier={this.renderAdminLevelList}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={this.handleModalCancelButtonClick} >
                                {this.props.entryStrings('cancelGeoSelectionButtonLabel')}
                            </Button>
                            <PrimaryButton onClick={this.handleModalSetButtonClick} >
                                {this.props.entryStrings('setGeoSelectionButtonLabel')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
                {!hideList &&
                    <ListView
                        className={styles.regionList}
                        data={flatValuesWithTitle}
                        emptyComponent={WidgetEmptyComponent}
                        keyExtractor={GeoSelection.valueKeyExtractor}
                        modifier={this.renderList}
                    />
                }
            </div>
        );
    }
}
