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
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types

};

const defaultProps = {
    attribute: undefined,
    data: [],
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
                        >
                            <span className={iconNames.close} />
                        </TransparentDangerButton>
                    </div>
                ),
            },
        ];

        this.state = {
            showMapModal: false,
            values: (props.attribute && props.attribute.values) || emptyList,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            this.setState({
                values: (nextProps.attribute && nextProps.attribute.values) || emptyList,
            });
        }
    }

    onMapSelect = (values) => {
        this.setState({
            values,
        });
    }

    mapRegionsList = (key, data) => (
        <div
            className={styles['regions-content']}
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
        this.setState({ showMapModal: true });
    }

    handleEditModalClose = () => {
        this.setState({ showMapModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showMapModal: false,
            values: this.props.data,
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

    render() {
        const {
            showMapModal,
            values,
        } = this.state;

        return (
            <div styleName="geo-list">
                <TransparentButton
                    onClick={this.handleModalOpen}
                    styleName="location-button"
                    title="Click to select a Geo Area"
                >
                    Geo Area <span className={iconNames.globe} />
                </TransparentButton>
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
                                placeholder="Select a country"
                            />
                        }
                    />
                    <ModalBody>
                        <RegionMap
                            styleName="map-content"
                            regionId={1}
                            onSelect={this.onMapSelect}
                            selections={values}
                        />
                        <div styleName="content">
                            <div styleName="search-box">
                                <h3>Selected Regions</h3>
                                <SelectInput
                                    showHintAndError={false}
                                    showLabel={false}
                                    placeholder="Search a location"
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
