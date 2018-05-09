import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import update from '../../../vendor/react-store/utils/immutable-update';

import ScaleInput from '../../../vendor/react-store/components/Input/ScaleInput';
import ColorInput from '../../../vendor/react-store/components/Input/ColorInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../../vendor/react-store/components/Action/Button/AccentButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import SortableList from '../../../vendor/react-store/components/View/SortableList';
import { randomString } from '../../../vendor/react-store/utils/common';
import BoundError from '../../../vendor/react-store/components/General/BoundError';

import WidgetError from '../../../components/WidgetError';
import { iconNames } from '../../../constants';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

const emptyList = [];
const emptyObject = {};

@BoundError(WidgetError)
export default class ScaleFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        const data = this.props.data || emptyObject;
        const scaleUnits = data.scaleUnits || emptyList;
        const defaultScaleUnit = data.value;
        const title = this.props.title;

        this.state = {
            showEditModal: false,
            defaultScaleUnit,
            scaleUnits,
            title,
        };
        this.props.editAction(this.handleEdit);
        this.createScaleUnits(props);
    }

    componentWillReceiveProps(nextProps) {
        const { data: newData } = nextProps.data;
        const { data: oldData } = this.props;

        if (oldData !== newData) {
            this.createScaleUnits(nextProps);
        }
    }

    getSelectedScaleStyle = (key) => {
        const { defaultScaleUnit } = this.state;
        const scaleUnitStyle = ['scale-unit'];
        if (defaultScaleUnit === key) {
            scaleUnitStyle.push('selected');
        }
        const styleNames = scaleUnitStyle.map(d => styles[d]);
        return styleNames.join(' ');
    }

    createScaleUnits = ({ data = emptyObject }) => {
        const scaleUnits = data.scaleUnits || emptyList;
        const tempScaleUnits = {};
        scaleUnits.forEach((s) => {
            tempScaleUnits[s.key] = s;
        });
        this.scaleUnits = tempScaleUnits;
    }

    handleScaleUnitSortChange = (scaleUnits) => {
        this.setState({ scaleUnits });
    }

    handleScaleSetDefaultButtonClick = (key) => {
        this.setState({ defaultScaleUnit: key });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleAddScaleUnitButtonClick = () => {
        this.addScaleUnit();
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        const {
            data = emptyObject,
            title,
        } = this.props;

        this.setState({
            showEditModal: false,
            defaultScaleUnit: data.value,
            scaleUnits: data.scaleUnits || emptyList,
            title,
        });
    }

    handleModalSaveButtonClick = () => {
        const {
            scaleUnits,
            title,
            defaultScaleUnit,
        } = this.state;
        const {
            data,
            onChange,
        } = this.props;

        const newScaleUnits = {
            ...data,
            value: defaultScaleUnit,
            scaleUnits,
        };

        this.setState({ showEditModal: false });
        onChange(
            newScaleUnits,
            title,
        );
    }

    handleScaleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleScaleUnitValueInputChange = (key, value) => {
        const rowIndex = this.state.scaleUnits.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                title: { $set: value },
            },
        };
        const newScaleUnits = update(this.state.scaleUnits, settings);

        this.setState({ scaleUnits: newScaleUnits });
    }

    handleScaleUnitRemoveButtonClick = (key) => {
        const { defaultScaleUnit } = this.state;
        const settings = {
            $filter: d => d.key !== key,
        };
        const newScaleUnits = update(this.state.scaleUnits, settings);
        if (defaultScaleUnit === key && newScaleUnits.length > 0) {
            const newDefaultScaleUnit = newScaleUnits[0].key;
            this.setState({ defaultScaleUnit: newDefaultScaleUnit });
        }
        this.setState({ scaleUnits: newScaleUnits });
    };

    handleColorChange = (newColor, key) => {
        const rowIndex = this.state.scaleUnits.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                color: { $set: newColor },
            },
        };

        const newScaleUnits = update(this.state.scaleUnits, settings);

        this.setState({ scaleUnits: newScaleUnits });
    }

    addScaleUnit = () => {
        const { defaultScaleUnit } = this.state;
        let newDefaultScaleUnit = defaultScaleUnit;
        const newScaleUnit = {
            key: randomString(16).toLowerCase(),
            title: '',
            color: '#ffffff',
        };

        const rowIndexForDefault = this.state.scaleUnits.findIndex(s => s.key === defaultScaleUnit);
        if (rowIndexForDefault === -1) {
            newDefaultScaleUnit = newScaleUnit.key;
        }

        this.setState({
            defaultScaleUnit: newDefaultScaleUnit,
            scaleUnits: [
                ...this.state.scaleUnits,
                newScaleUnit,
            ],
        });
    }

    renderDragHandle = () => {
        const dragStyle = [styles.dragHandle];
        return (
            <span className={`${iconNames.hamburger} ${dragStyle.join(' ')}`} />
        );
    };

    renderScaleUnit = (key, data) => {
        const { defaultScaleUnit } = this.state;
        let defaultIconName = iconNames.checkboxOutlineBlank;
        if (defaultScaleUnit === key) {
            defaultIconName = iconNames.checkbox;
        }

        const colorInputLabel = _ts('af', 'colorLabel');
        const titleInputPlaceholder = _ts('af', 'titlePlaceholderScale');
        const titleInputLabel = _ts('af', 'titleLabel');
        const defaultButtonLabel = _ts('af', 'defaultButtonLabel');

        return (
            <div
                className={`${styles.editScaleUnit} ${styles.draggableItem}`}
                key={key}
            >
                <ColorInput
                    label={colorInputLabel}
                    onChange={newColor => this.handleColorChange(newColor, key)}
                    value={data.color}
                    showHintAndError={false}
                />
                <TextInput
                    className={styles.titleInput}
                    label={titleInputLabel}
                    placeholder={titleInputPlaceholder}
                    onChange={(value) => { this.handleScaleUnitValueInputChange(key, value); }}
                    value={data.title}
                    showHintAndError={false}
                    autoFocus
                />
                <AccentButton
                    className={styles.checkButton}
                    onClick={() => { this.handleScaleSetDefaultButtonClick(key); }}
                    id={`${key}-check-button`}
                    transparent
                >
                    <label
                        className={styles.label}
                        htmlFor={`${key}-check-button`}
                    >
                        { defaultButtonLabel }
                    </label>
                    <span className={defaultIconName} />
                </AccentButton>
                <DangerButton
                    className={styles.deleteButton}
                    onClick={() => { this.handleScaleUnitRemoveButtonClick(key); }}
                    transparent
                >
                    <span className={iconNames.delete} />
                </DangerButton>
            </div>
        );
    }


    renderEditModal = () => {
        const {
            scaleUnits,
            showEditModal,
            title,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const headerTitle = _ts('af', 'editScaleModalTitle');
        const addScaleUnitButtonLabel = _ts('af', 'addscaleUnitButtonLabel');
        const titleInputLabel = _ts('af', 'titleLabel');
        const titleInputPlaceholder = _ts('af', 'titlePlaceholderScale');
        const cancelButtonLabel = _ts('af', 'cancelButtonLabel');
        const saveButtonLabel = _ts('af', 'saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <ModalHeader
                    title={headerTitle}
                    rightComponent={
                        <PrimaryButton
                            iconName={iconNames.add}
                            onClick={this.handleAddScaleUnitButtonClick}
                            transparent
                        >
                            { addScaleUnitButtonLabel }
                        </PrimaryButton>
                    }
                />
                <ModalBody className={styles.body}>
                    <div className={styles.titleInputContainer} >
                        <TextInput
                            label={titleInputLabel}
                            placeholder={titleInputPlaceholder}
                            onChange={this.handleScaleWidgetTitleChange}
                            value={title}
                            showHintAndError={false}
                            autoFocus
                            selectOnFocus
                        />
                    </div>
                    <div className={styles.scaleUnits}>
                        <SortableList
                            className={styles.scaleUnit}
                            data={scaleUnits}
                            modifier={this.renderScaleUnit}
                            onChange={this.handleScaleUnitSortChange}
                            sortableItemClass={styles.sortableUnit}
                            keyExtractor={ScaleFrameworkList.rowKeyExtractor}
                            dragHandleModifier={this.renderDragHandle}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleModalCancelButtonClick}>
                        { cancelButtonLabel }
                    </Button>
                    <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                        { saveButtonLabel }
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const { defaultScaleUnit } = this.state;
        const EditModal = this.renderEditModal;

        return (
            <Fragment>
                <ScaleInput
                    options={this.scaleUnits}
                    value={defaultScaleUnit}
                    readOnly
                />
                <EditModal key="modal" />
            </Fragment>
        );
    }
}
