import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    Button,
    PrimaryButton,
    TransparentButton,
} from '../../../../../public/components/Action';
import {
    SelectInput,
} from '../../../../../public/components/Input';
import {
    unique,
} from '../../../../../public/utils/common';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../../../public/components/View';
import {
    iconNames,
} from '../../../../../common/constants';
import RegionMap from '../../../../../common/components/RegionMap';


const propTypes = {
    // id: PropTypes.number.isRequired,
    // entryId: PropTypes.string.isRequired,
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

        this.state = {
            showMapModal: false,
            values: props.data || emptyList,
        };
    }

    // onMapSelect = (value) => {
    //     console.warn(value);
    // }

    onMapSelect = (value) => {
        console.log(value);
        const newValues = unique(this.state.values.concat(value), v => v);
        this.setState({
            values: newValues,
        });
    }

    mapSelectedRegions = (key, data) => (
        <div
            className="selected-regions"
            key={key}
        >
            {data}
        </div>
    )

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
                >
                    Location <i className={iconNames.globe} />
                </TransparentButton>
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
                        />
                        <ListView
                            data={values}
                            keyExtractor={GeoTaggingList.valueKeyExtractor}
                            modifier={this.mapSelectedRegions}
                        />
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
