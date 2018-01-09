import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../public/components/View';
import {
    SelectInput,
} from '../../../public/components/Input';
import { FgRestBuilder } from '../../../public/utils/rest';
import {
    Button,
    PrimaryButton,
    TransparentAccentButton,
    TransparentDangerButton,
} from '../../../public/components/Action';
import {
    createUrlForGeoOptions,
    createParamsForGeoOptionsGET,

    transformResponseErrorToFormError,
} from '../../../common/rest';
import {
    geoOptionsForProjectSelector,
    setGeoOptionsAction,
} from '../../../common/redux';
import {
    iconNames,
    entryStrings,
} from '../../constants';
import schema from '../../../common/schema';
import notify from '../../../common/notify';
import update from '../../../public/utils/immutable-update';

import RegionMap from '../RegionMap';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    projectId: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired, //eslint-disable-line
    regions: PropTypes.array.isRequired, //eslint-disable-line
    disabled: PropTypes.bool.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    geoOptions: PropTypes.object, //eslint-disable-line
};

const defaultProps = {
    className: '',
    geoOptions: {},
};

const emptyList = [];
const emptyObject = {};

const mapStateToProps = (state, props) => ({
    geoOptions: geoOptionsForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class GeoSelection extends React.PureComponent {
    static valueKeyExtractor = d => d;
    static shortLabelSelector = d => d.shortLabel;
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

        this.state = {
            showMapModal: false,
            selectedRegion: undefined,
            locations,
            flatLocations,
            values,
            flatValues,
        };
    }

    componentWillMount() {
        const { projectId } = this.props;
        this.geoOptionsRequest = this.createGeoOptionsRequest(projectId);
        this.geoOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { geoOptions, value } = nextProps;

        if (geoOptions !== this.props.geoOptions) {
            const locations = geoOptions;
            const flatLocations = GeoSelection.createFlatLocations(locations);

            const { flatValues } = this.state;
            const values = GeoSelection.createNonFlatValues(locations, flatValues);

            this.setState({
                values,
                locations,
                flatLocations,
            });
        }

        if (value !== this.props.value) {
            const { locations } = this.state;
            const flatValues = value || emptyList;
            const values = GeoSelection.createNonFlatValues(locations, flatValues);

            this.setState({
                flatValues,
                values,
            });
        }
    }

    createGeoOptionsRequest = (projectId) => {
        const geoOptionsRequest = new FgRestBuilder()
            .url(createUrlForGeoOptions(projectId))
            .params(() => createParamsForGeoOptionsGET())
            .success((response) => {
                try {
                    schema.validate(response, 'geoOptions');
                    this.props.setGeoOptions({
                        projectId,
                        locations: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: entryStrings.entriesTabLabel,
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: entryStrings.entriesTabLabel,
                    type: notify.type.ERROR,
                    message: entryStrings.geoOptionsFatalMessage,
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return geoOptionsRequest;
    };

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
        const { values } = this.state;
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
        const { flatValues } = this.state;
        if (this.props.onChange) {
            this.props.onChange(flatValues);
        }
        this.setState({ showMapModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState(
            {
                values: this.props.value,
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
        if (this.props.onChange) {
            this.props.onChange(newFlatValues);
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

    renderSelectedList = (key, data) => {
        const { locations, selectedRegion } = this.state;
        const regionData = (locations[selectedRegion] || emptyList)
            .find(d => d.key === data) || emptyObject;

        return (
            <div
                className={styles['region-item']}
                key={key}
            >
                {regionData.shortLabel}
                <TransparentDangerButton
                    onClick={() => this.handleRegionRemove(key)}
                >
                    <span className={iconNames.delete} />
                </TransparentDangerButton>
            </div>
        );
    }

    render() {
        const {
            className,
            label,
            disabled,
            regions,
        } = this.props;

        const {
            showMapModal,
            selectedRegion,
            values,
            flatValues,
            locations,
            flatLocations,
        } = this.state;

        return (
            <div
                className={className}
                styleName="geo-selection"
            >
                <SelectInput
                    className="flat-select-input"
                    label={label}
                    showHintAndError={false}
                    onChange={this.handleFlatSelectChange}
                    options={flatLocations}
                    value={flatValues}
                    disabled={disabled}
                    multiple
                />
                <TransparentAccentButton
                    styleName="map-modal-button"
                    onClick={this.handleGeoSelectButtonClick}
                >
                    <span className={iconNames.globe} />
                </TransparentAccentButton>
                <Modal
                    styleName="modal"
                    show={showMapModal}
                    onClose={this.handleMapModalClose}
                    closeOnEscape
                >
                    <ModalHeader
                        title="Geo selection"
                        rightComponent={
                            <div styleName="location-selects">
                                <SelectInput
                                    showHintAndError={false}
                                    showLabel={false}
                                    placeholder={entryStrings.regionSelectPlaceholder}
                                    options={regions}
                                    keySelector={this.regionKeySelector}
                                    labelSelector={this.regionLabelSelector}
                                    onChange={this.handleRegionSelection}
                                    optionsIdentifier="region-select-options"
                                    value={selectedRegion}
                                    clearable={false}
                                />
                                <SelectInput
                                    styleName="map-selection-select"
                                    onChange={this.handleLocationSelection}
                                    options={locations[selectedRegion]}
                                    labelSelector={GeoSelection.shortLabelSelector}
                                    placeholder={entryStrings.locationSelectPlaceholder}
                                    optionsIdentifier="location-select-options"
                                    showHintAndError={false}
                                    showLabel={false}
                                    value={values[selectedRegion]}
                                    multiple
                                />
                            </div>
                        }
                    />
                    <ModalBody styleName="map-modal">
                        <RegionMap
                            styleName="map"
                            regionId={selectedRegion}
                            onChange={this.handleMapSelect}
                            selections={values[selectedRegion]}
                        />
                        <div styleName="map-selections">
                            <ListView
                                styleName="map-selections-list"
                                data={values[selectedRegion]}
                                keyExtractor={GeoSelection.valueKeyExtractor}
                                modifier={this.renderSelectedList}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={this.handleModalCancelButtonClick}
                        >
                            {entryStrings.cancelGeoSelectionButtonLabel}
                        </Button>
                        <PrimaryButton
                            onClick={this.handleModalSetButtonClick}
                        >
                            {entryStrings.setGeoSelectionButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
