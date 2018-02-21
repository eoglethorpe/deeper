import PropTypes from 'prop-types';
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';
import { connect } from 'react-redux';

import { randomString } from '../../../vendor/react-store/utils/common';
import update from '../../../vendor/react-store/utils/immutable-update';

import ColorInput from '../../../vendor/react-store/components/Input/ColorInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import ListView from '../../../vendor/react-store/components/View/List/ListView';

import { iconNames } from '../../../constants';
import BoundError from '../../../components/BoundError';
import { afStringsSelector } from '../../../redux';

import MatrixRow from './MatrixRow';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: {
        rows: [],
    },
};

const DragHandle = SortableHandle(() => (
    <span className={`${iconNames.hamburger} drag-handle`} />
));

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
export default class Matrix1dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const data = this.props.data || { rows: [] };

        this.state = {
            showEditModal: false,
            title: props.title,
            data,
        };

        this.props.editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        const data = nextProps.data || { rows: [] };
        this.setState({ data });
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        const data = { ...this.state.data };
        data.rows = arrayMove(data.rows, oldIndex, newIndex);
        this.setState({ data });
    }

    handleColorChange = (newColor, key) => {
        const { data } = this.state;
        const rowIndex = data.rows.findIndex(d => d.key === key);

        const settings = {
            rows: {
                [rowIndex]: {
                    color: { $set: newColor },
                },
            },
        };

        const newData = update(this.state.data, settings);

        this.setState({ data: newData });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleRowDataChange = (key, cells) => {
        const { data } = this.state;
        const rowIndex = data.rows.findIndex(d => d.key === key);
        const settings = {
            rows: {
                [rowIndex]: {
                    cells: { $set: cells },
                },
            },
        };
        const newData = update(data, settings);

        this.props.onChange(
            newData,
        );
    }

    handleRowRemoveButtonClick = (key) => {
        const { data } = this.state;
        const rowIndex = data.rows.findIndex(d => d.key === key);
        const settings = {
            rows: {
                $splice: [[rowIndex, 1]],
            },
        };
        const newData = update(data, settings);
        this.setState({ data: newData });
    }

    handleRowValueInputChange = (key, value, name) => {
        const { data } = this.state;
        const rowIndex = data.rows.findIndex(d => d.key === key);
        const settings = {
            rows: {
                [rowIndex]: {
                    [name]: { $set: value },
                },
            },
        };
        const newData = update(data, settings);
        this.setState({ data: newData });
    }

    handleAddRowButtonClick = () => {
        const { data } = this.state;

        const newRow = {
            key: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
            color: '#000000',
            cells: [],
        };
        const settings = {
            rows: {
                $push: [newRow],
            },
        };
        const newData = update(data, settings);
        this.setState({ data: newData });
    }

    handleEditRowModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            data: this.props.data,
            title: this.props.title,
        });
    }

    handleEditRowModalSaveButtonClick = () => {
        this.setState({
            showEditModal: false,
        });
        this.props.onChange(
            this.state.data,
            this.state.title,
        );
    }

    SortableEditRow = SortableElement(({ value: { data, key } }) => (
        <div
            className={`${styles['edit-row']} ${styles['draggable-item']}`}
            key={key}
        >
            <DragHandle />
            <ColorInput
                label={this.props.afStrings('colorLabel')}
                onChange={newColor => this.handleColorChange(newColor, key)}
                value={data.color}
            />
            <TextInput
                className={styles['title-input']}
                label={this.props.afStrings('titleLabel')}
                placeholder={this.props.afStrings('optionPlaceholder')}
                onChange={value => this.handleRowValueInputChange(key, value, 'title')}
                value={data.title}
                autoFocus
            />
            <TextInput
                className={styles['title-input']}
                label={this.props.afStrings('tooltipTitle')}
                placeholder={this.props.afStrings('tooltipPlaceholder')}
                onChange={value => this.handleRowValueInputChange(key, value, 'tooltip')}
                value={data.tooltip}
            />
            <DangerButton
                className={styles['delete-button']}
                onClick={() => this.handleRowRemoveButtonClick(key)}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    ))

    SortableList = SortableContainer(({ items: rows }) => {
        let additionalStyle = '';

        if (rows.length === 0) {
            additionalStyle = styles['no-items'];
        }

        return (
            <ListView
                data={rows}
                className={`${styles['row-list']} ${additionalStyle}`}
                keyExtractor={Matrix1dOverview.rowKeyExtractor}
                modifier={this.renderEditRow}
            />
        );
    })

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    renderRow = (key, data) => (
        <MatrixRow
            key={key}
            title={data.title}
            cells={data.cells}
            onChange={(value) => { this.handleRowDataChange(key, value); }}
        />
    )

    renderEditRow = (key, data, index) => (
        <this.SortableEditRow key={key} index={index} value={{ key, data }} />
    );

    renderEditRowModal = () => {
        const {
            data,
            showEditModal,
            title: titleValue,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const { afStrings } = this.props;

        const headerTitle = afStrings('editRowModalTitle');
        const addRowButtonLabel = afStrings('addRowButtonLabel');
        const titleInputLabel = afStrings('titleLabel');
        const titleInputPlaceholder = afStrings('titlePlaceholderScale');
        const cancelButtonLabel = afStrings('cancelButtonLabel');
        const saveButtonLabel = afStrings('saveButtonLabel');

        return (
            <Modal className={styles['edit-row-modal']}>
                <ModalHeader
                    title={headerTitle}
                    rightComponent={
                        <PrimaryButton
                            onClick={this.handleAddRowButtonClick}
                            transparent
                        >
                            { addRowButtonLabel }
                        </PrimaryButton>
                    }
                />
                <ModalBody className={styles.body}>
                    <div className={styles['general-info-container']}>
                        <TextInput
                            autoFocus
                            className={styles['title-input']}
                            label={titleInputLabel}
                            onChange={this.handleWidgetTitleChange}
                            placeholder={titleInputPlaceholder}
                            selectOnFocus
                            showHintAndError={false}
                            value={titleValue}
                        />
                    </div>
                    <div className={styles['modal-rows-content']}>
                        <this.SortableList
                            items={data.rows}
                            lockAxis="y"
                            lockToContainerEdges
                            onSortEnd={this.onSortEnd}
                            useDragHandle
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        onClick={this.handleEditRowModalCancelButtonClick}
                    >
                        { cancelButtonLabel }
                    </Button>
                    <PrimaryButton
                        onClick={this.handleEditRowModalSaveButtonClick}
                    >
                        { saveButtonLabel }
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const { data } = this.state;
        const EditRowModal = this.renderEditRowModal;

        return (
            <div className={styles.overview}>
                <ListView
                    data={data.rows}
                    className={styles.rows}
                    keyExtractor={Matrix1dOverview.rowKeyExtractor}
                    modifier={this.renderRow}
                />
                <EditRowModal />
            </div>
        );
    }
}
