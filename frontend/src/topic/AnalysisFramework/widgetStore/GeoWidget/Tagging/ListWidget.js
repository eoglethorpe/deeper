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
} from '../../../../../common/constants';
import RegionMap from '../../../../../common/components/RegionMap';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
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
                label: 'Region',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'actions',
                label: 'Actions',
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
        const { api, id, entryId } = this.props;
        api.getEntryModifier(entryId)
            .setAttribute(id, {
                values: this.state.values,
            })
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
                        title="Click to select a Geo Area"
                    >
                        Geo Area <span className={iconNames.globe} />
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
                        title="Geographic Location"
                        rightComponent={
                            <SelectInput
                                showHintAndError={false}
                                showLabel={false}
                                placeholder="Select a region"
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
                                <h3>Selected Regions</h3>
                                <SelectInput
                                    showHintAndError={false}
                                    showLabel={false}
                                    placeholder="Search a location"
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
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleModalSaveButtonClick}
                        >
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
