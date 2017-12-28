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
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../../../../../public/components/View';
import {
    iconNames,
} from '../../../../../common/constants';
import RegionMap from '../../../../../common/components/RegionMap';


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
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showMapModal: false,
            values: props.data || emptyList,
        };
    }

    handleChange = (value) => {
        const { api, id, entryId } = this.props;
        api.getEntryModifier(entryId)
            .setAttribute(id, {
                value,
            })
            .apply();
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
        this.setState({
            showMapModal: false,
        });

        // this.props.onChange(this.state.values);
    }

    render() {
        const {
            attribute = {},
        } = this.props;

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
                            regionId={112}
                        />
                        <div styleName="selected-regions">
                            Selected Regions
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
