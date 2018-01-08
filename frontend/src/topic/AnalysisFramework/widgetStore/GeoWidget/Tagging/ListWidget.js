import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    Button,
    PrimaryButton,
    TransparentButton,
    TransparentDangerButton,
} from '../../../../../public/components/Action';
import {
    SelectInput,
} from '../../../../../public/components/Input';
import update from '../../../../../public/utils/immutable-update';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
    Table,
} from '../../../../../public/components/View';
import {
    iconNames,
    afStrings,
} from '../../../../../common/constants';
import RegionMap from '../../../../../common/components/RegionMap';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    exportable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object,      // eslint-disable-line

};

const defaultProps = {
    attribute: undefined,
};

const emptyList = [];

@CSSModules(styles)
export default class GeoTaggingList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.tableHeaders = [
            {
                key: 'title',
                label: afStrings.tableHeaderRegion,
                order: 1,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'actions',
                label: afStrings.tableHeaderActions,
                order: 2,
                modifier: row => (
                    <div className="actions">
                        <TransparentDangerButton
                            onClick={() => this.handleRemoveButtonClick(row.key)}
                            title="Remove Location"
                        >
                            <span className={iconNames.close} />
                        </TransparentDangerButton>
                    </div>
                ),
            },
        ];

        this.state = {
            showMapModal: false,
            selectedRegion: undefined,
            values: (props.attribute && props.attribute.values) || emptyList,
            locations: {},
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            this.setState({
                values: (nextProps.attribute && nextProps.attribute.values) || emptyList,
            });
        }
    }

    createFilterData = attribute => ({
        values: attribute.values.map(v => v.key),
        number: undefined,
    })

    createExportData = attribute => ({
        excel: {
            values: attribute.values.map(v => v.key),
        },
    })

    mapRegionsList = (key, data) => (
        <div
            className={styles['region-content']}
            key={key}
        >
            <span className={styles['region-name']}>{data.title}</span>
        </div>
    )

    handleRemoveButtonClick = (key) => {
        const newValues = this.state.values.filter(d => d.key !== key);
        this.setState({
            values: newValues,
        });
    }

    handleModalOpen = () => {
        if (this.props.api.getProject().regions.length > 0) {
            this.setState({
                selectedRegion: this.props.api.getProject().regions[0].id,
            });
        }
        this.setState({ showMapModal: true });
    }

    handleEditModalClose = () => {
        this.setState({ showMapModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showMapModal: false,
            values: (this.props.attribute && this.props.attribute.values) || emptyList,
        });
    }

    handleModalSaveButtonClick = () => {
        const { api, id, entryId, filters, exportable } = this.props;
        const attribute = {
            values: this.state.values,
        };
        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .setFilterData(filters[0].id, this.createFilterData(attribute))
            .setExportData(exportable.id, this.createExportData(attribute))
            .apply();
        this.setState({
            showMapModal: false,
        });
    }

    handleMapSelect = (values) => {
        const locations = this.state.locations;
        const settings = {
            [this.state.selectedRegion]: { $autoArray: {
                $filter: l => !values.find(v => v.key === l.key),
            } },
        };
        this.setState({
            values,
            locations: update(locations, settings),
        });
    }

    handleMapLocationsChange = (newLocations) => {
        const { locations, selectedRegion, values } = this.state;
        const settings = {
            [selectedRegion]: { $autoArray: {
                $set: newLocations.filter(l => !values.find(v => v.key === l.key)),
            } },
        };

        this.setState({
            locations: update(locations, settings),
        });
    }

    handleRegionSelection = (selectedRegion) => {
        this.setState({
            selectedRegion,
        });
    }

    handleLocationSelection = (selection) => {
        if (!selection) {
            return;
        }

        if (!this.state.values.find(v => v.key === selection)) {
            const { locations, selectedRegion } = this.state;
            const location = locations[selectedRegion].find(
                l => l.key === selection,
            );
            const values = [
                ...this.state.values,
                {
                    key: location.key,
                    title: location.label,
                },
            ];

            const settings = {
                [selectedRegion]: {
                    $filter: l => !values.find(v => v.key === l.key),
                },
            };

            this.setState({
                values,
                locations: update(locations, settings),
            });
        }
    }

    regionKeySelector = d => d.id

    regionLabelSelector = d => d.title

    render() {
        const {
            locations,
            showMapModal,
            selectedRegion,
            values,
        } = this.state;

        return (
            <div styleName="geo-list">
                <div styleName="geo-button-wrapper">
                    <TransparentButton
                        onClick={this.handleModalOpen}
                        styleName="location-button"
                        title={afStrings.electGeoAreaButtonTitle}
                    >
                        {afStrings.geoAreaButtonLabel} <span className={iconNames.globe} />
                    </TransparentButton>
                </div>
                <ListView
                    data={values}
                    className={styles['region-list']}
                    keyExtractor={GeoTaggingList.valueKeyExtractor}
                    modifier={this.mapRegionsList}
                />
                <Modal
                    styleName="map-modal"
                    show={showMapModal}
                    onClose={this.handleEditModalClose}
                >
                    <ModalHeader
                        title={afStrings.geoWidgetLabel}
                        rightComponent={
                            <SelectInput
                                showHintAndError={false}
                                showLabel={false}
                                placeholder={afStrings.selectRegionPlaceholder}
                                options={this.props.api.getProject().regions}
                                keySelector={this.regionKeySelector}
                                labelSelector={this.regionLabelSelector}
                                onChange={this.handleRegionSelection}
                                optionsIdentifier="region-select-options"
                                value={selectedRegion}
                                clearable={false}
                            />
                        }
                    />
                    <ModalBody>
                        <RegionMap
                            styleName="map-content"
                            regionId={selectedRegion}
                            onChange={this.handleMapSelect}
                            onLocationsChange={this.handleMapLocationsChange}
                            selections={values}
                        />
                        <div styleName="content">
                            <div styleName="search-box">
                                <h3>{afStrings.selectedRegionsLabel}</h3>
                                <SelectInput
                                    showHintAndError={false}
                                    showLabel={false}
                                    placeholder={afStrings.searchLocationPlaceholder}
                                    options={locations[selectedRegion]}
                                    optionsIdentifier="location-select-options"
                                    onChange={this.handleLocationSelection}
                                    value="invalid"
                                />
                            </div>
                            <div styleName="regions-table">
                                <Table
                                    data={values}
                                    headers={this.tableHeaders}
                                    keyExtractor={GeoTaggingList.valueKeyExtractor}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={this.handleModalCancelButtonClick}
                        >
                            {afStrings.cancelButtonLabel}
                        </Button>
                        <PrimaryButton
                            onClick={this.handleModalSaveButtonClick}
                        >
                            {afStrings.saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
