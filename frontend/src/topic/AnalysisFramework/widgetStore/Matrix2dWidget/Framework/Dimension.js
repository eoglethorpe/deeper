import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    iconNames,
    afStrings,
} from '../../../../../common/constants';
import {
    randomString,
    getColorOnBgColor,
} from '../../../../../public/utils/common';
import update from '../../../../../public/utils/immutable-update';

import {
    TransparentButton,
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    TextInput,
} from '../../../../../public/components/Input';

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../../../public/components/View';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
    data: {},
};

const emptyList = [];
const subdimensionKeyExtractor = d => d.id;

@CSSModules(styles, { allowMultiple: true })
export default class Dimension extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            data: props.data,
            showEditDimensionModal: false,
            rowStyle: {
                backgroundColor: props.data.color,
                color: getColorOnBgColor(props.data.color),
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data,
            rowStyle: {
                backgroundColor: nextProps.data.color,
                color: getColorOnBgColor(nextProps.data.color),
            },
        });
    }

    getModalTitle = () => {
        const {
            data,
        } = this.props;

        if (data.title) {
            return `Add dimension to ${data.title}`;
        }

        return 'Add dimension';
    }

    getStyleName = () => {
        const styleNames = [];
        styleNames.push('dimension');

        return styleNames.join(' ');
    }

    getSettingsForInputValueChange = (i, key, value) => ({
        subdimensions: { $autoArray: {
            [i]: { $auto: {
                [key]: { $auto: {
                    $set: value,
                } },
            } },
        } },
    })

    addSubdimension = () => {
        const newSubdimension = {
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
        };

        const settings = {
            subdimensions: {
                $autoPush: [newSubdimension],
            },
        };

        this.updateData(settings);
    }


    updateData = (settings) => {
        const { data } = this.state;
        const newData = update(data, settings);

        this.setState({
            data: newData,
        });
    }

    handleEditButtonClick = () => {
        this.setState({
            showEditDimensionModal: true,
        });
    }

    handleAddSubdimensionButtonClick = () => {
        this.addSubdimension();
    }

    handleSubdimensionTitleInputChange = (i, value) => {
        const settings = this.getSettingsForInputValueChange(i, 'title', value);
        this.updateData(settings);
    }

    handleSubdimensionTooltipInputChange = (i, value) => {
        const settings = this.getSettingsForInputValueChange(i, 'tooltip', value);
        this.updateData(settings);
    }

    handleDeleteSubdimensionButtonClick = (i) => {
        const settings = {
            subdimensions: {
                $splice: [[i, 1]],
            },
        };

        this.updateData(settings);
    }

    handleEditDimensionModalClose = () => {}

    handleEditDimensionModalCancelButtonClick = () => {
        this.setState({
            data: this.props.data,
            showEditDimensionModal: false,
        });
    }

    handleEditDimensionModalSaveButtonClick = () => {
        const {
            data,
            onChange,
        } = this.props;

        onChange(data.id, this.state.data);

        this.setState({
            showEditDimensionModal: false,
        });
    }

    renderSubdimension = (key, data) => (
        <div
            key={data.id}
            className={styles.subdimension}
            style={this.state.rowStyle}
        >
            { data.title }
        </div>
    )

    renderEditSubdimension = (key, data, i) => (
        <div
            key={data.id}
            className={styles['edit-subdimension']}
        >
            <TextInput
                label="title"
                onChange={(value) => { this.handleSubdimensionTitleInputChange(i, value); }}
                value={data.title}
            />
            <TextInput
                label="tooltip"
                onChange={(value) => { this.handleSubdimensionTooltipInputChange(i, value); }}
                value={data.tooltip}
            />
            <TransparentButton
                onClick={() => { this.handleDeleteSubdimensionButtonClick(i); }}
            >
                <span className={iconNames.delete} />
            </TransparentButton>
        </div>
    )

    render() {
        const {
            data,
            showEditDimensionModal,
        } = this.state;

        // const styleName = this.getStyleName();
        const styleName = 'dimension';

        return (
            <div
                styleName={styleName}
            >
                <div
                    styleName="title"
                    style={this.state.rowStyle}
                >
                    { data.title }
                </div>
                <ListView
                    styleName="subdimensions"
                    data={data.subdimensions || emptyList}
                    modifier={this.renderSubdimension}
                    keyExtractor={subdimensionKeyExtractor}
                />
                <TransparentButton
                    styleName="edit-dimension-button"
                    onClick={this.handleEditButtonClick}
                >
                    <span className={iconNames.edit} />
                </TransparentButton>
                <Modal
                    show={showEditDimensionModal}
                    styleName="edit-dimension-modal"
                    onClose={this.handleEditDimensionModalClose}
                >
                    <ModalHeader
                        title={this.getModalTitle()}
                        rightComponent={
                            <TransparentButton
                                onClick={this.handleAddSubdimensionButtonClick}
                            >
                                Add subdimension
                            </TransparentButton>
                        }
                    />
                    <ModalBody styleName="modal-body">
                        <ListView
                            styleName="list"
                            data={data.subdimensions || emptyList}
                            modifier={this.renderEditSubdimension}
                            keyExtractor={d => d.id}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={this.handleEditDimensionModalCancelButtonClick}
                        >
                            {afStrings.cancelButtonLabel}
                        </Button>
                        <PrimaryButton
                            onClick={this.handleEditDimensionModalSaveButtonClick}
                        >
                            {afStrings.saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
