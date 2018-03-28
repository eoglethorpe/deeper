import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../../vendor/react-store/utils/immutable-update';
import { randomString } from '../../../vendor/react-store/utils/common';
import NumberInput from '../../../vendor/react-store/components/Input/NumberInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import List from '../../../vendor/react-store/components/View/List';
import SortableList from '../../../vendor/react-store/components/View/SortableList';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import { iconNames } from '../../../constants';
import { afStringsSelector } from '../../../redux';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: undefined,
};

const emptyObject = {};
const emptyList = [];

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError(WidgetError)
@connect(mapStateToProps)
export default class NumberMatrixOverview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        const rowHeaders = (props.data || emptyObject).rowHeaders || emptyList;
        const columnHeaders = (props.data || emptyObject).columnHeaders || emptyList;

        this.state = {
            showEditModal: false,
            rowHeaders,
            columnHeaders,
            title: props.title,
        };

        props.editAction(this.handleEdit);
    }

    handleRowListSortChange = (rowHeaders) => {
        this.setState({ rowHeaders });
    }

    handleColumnListSortChange = (columnHeaders) => {
        this.setState({ columnHeaders });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            rowHeaders: (this.props.data || emptyObject).rowHeaders || emptyList,
            columnHeaders: (this.props.data || emptyObject).columnHeaders || emptyList,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { rowHeaders, columnHeaders, title } = this.state;
        const newData = {
            ...this.props.data,
            rowHeaders,
            columnHeaders,
        };
        this.props.onChange(
            newData,
            title,
        );
    }

    handleUnitInputChange = (key, value, dimension, type) => {
        let index = -1;
        if (dimension === 'row') {
            index = this.state.rowHeaders.findIndex(d => d.key === key);
        } else if (dimension === 'column') {
            index = this.state.columnHeaders.findIndex(d => d.key === key);
        }

        if (index !== -1) {
            const settings = {
                [index]: {
                    [type]: { $set: value },
                },
            };

            if (dimension === 'row') {
                const newHeaders = update(this.state.rowHeaders, settings);
                this.setState({ rowHeaders: newHeaders });
            } else if (dimension === 'column') {
                const newHeaders = update(this.state.columnHeaders, settings);
                this.setState({ columnHeaders: newHeaders });
            }
        }
    }

    handleColUnitRemoveButtonClick = (key) => {
        const settings = {
            $filter: d => d.key !== key,
        };
        const newColumnHeaders = update(this.state.columnHeaders, settings);

        this.setState({ columnHeaders: newColumnHeaders });
    }

    handleRowUnitRemoveButtonClick = (key) => {
        const settings = {
            $filter: d => d.key !== key,
        };
        const newRowHeaders = update(this.state.rowHeaders, settings);

        this.setState({ rowHeaders: newRowHeaders });
    }

    handleAddButtonClick = (type) => {
        const newUnit = {
            key: randomString(16).toLowerCase(),
            title: '',
        };
        if (type === 'row') {
            this.addRowUnit(newUnit);
        } else if (type === 'column') {
            this.addColumnUnit(newUnit);
        }
    }

    addRowUnit = (newRow) => {
        this.setState({
            rowHeaders: [
                ...this.state.rowHeaders,
                newRow,
            ],
        });
    }

    addColumnUnit = (newColumn) => {
        this.setState({
            columnHeaders: [
                ...this.state.columnHeaders,
                newColumn,
            ],
        });
    }

    renderColumnUnit = (key, data) => (
        <div
            className={`${styles.rowColElement} ${styles.draggableItem}`}
            key={key}
        >
            <TextInput
                className={styles.titleInput}
                label={this.props.afStrings('titleLabel')}
                placeholder={this.props.afStrings('titlePlaceholderColumn')}
                onChange={(value) => { this.handleUnitInputChange(key, value, 'column', 'title'); }}
                value={data.title}
                showHintAndError={false}
                autoFocus
            />
            <TextInput
                className={styles.titleInput}
                label={this.props.afStrings('tooltipTitle')}
                placeholder={this.props.afStrings('tooltipPlaceholder')}
                onChange={(value) => { this.handleUnitInputChange(key, value, 'column', 'tooltip'); }}
                value={data.tooltip}
                showHintAndError={false}
            />
            <DangerButton
                className={styles.deleteButton}
                onClick={() => { this.handleColUnitRemoveButtonClick(key); }}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    )

    renderDragHandle = () => {
        const dragStyle = [styles.dragHandle];
        return (
            <span className={`${iconNames.hamburger} ${dragStyle.join(' ')}`} />
        );
    };

    renderRowUnit = (key, data) => (
        <div
            className={`${styles.rowColElement} ${styles.draggableItem}`}
            key={key}
        >
            <TextInput
                className={styles.titleInput}
                label={this.props.afStrings('titleLabel')}
                placeholder={this.props.afStrings('titlePlaceholderRow')}
                onChange={(value) => { this.handleUnitInputChange(key, value, 'row', 'title'); }}
                value={data.title}
                showHintAndError={false}
                autoFocus
            />
            <TextInput
                className={styles.titleInput}
                label={this.props.afStrings('tooltipTitle')}
                placeholder={this.props.afStrings('tooltipPlaceholder')}
                onChange={(value) => { this.handleUnitInputChange(key, value, 'row', 'tooltip'); }}
                value={data.tooltip}
                showHintAndError={false}
            />
            <DangerButton
                className={styles.deleteButton}
                onClick={() => { this.handleRowUnitRemoveButtonClick(key); }}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    )

    renderColHeader = (key, data) => (
        <th
            className={styles.tableHeader}
            scope="col"
            key={key}
        >
            {data.title}
        </th>
    )

    renderColElement = (key, data, rowKey) => (
        <td
            className={styles.tableCell}
            key={`${rowKey}-${key}`}
        >
            <NumberInput
                className={styles.numberInput}
                placeholder={this.props.afStrings('numberPlaceholder')}
                showLabel={false}
                showHintAndError={false}
                separator=" "
                disabled
            />
        </td>
    )

    renderRow = (key, data) => {
        const { columnHeaders } = this.state;

        return (
            <tr key={key}>
                <th
                    className={styles.tableHeader}
                    scope="row"
                >
                    {data.title}
                </th>
                <List
                    data={columnHeaders}
                    modifier={(colKey, colData) => this.renderColElement(colKey, colData, key)}
                    keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                />
            </tr>
        );
    }

    renderMatrix = () => {
        const { rowHeaders, columnHeaders } = this.state;

        return (
            <table>
                <tbody>
                    <tr>
                        <td />
                        <List
                            data={columnHeaders}
                            modifier={this.renderColHeader}
                            keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                        />
                    </tr>
                    <List
                        data={rowHeaders}
                        modifier={this.renderRow}
                        keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                    />
                </tbody>
            </table>
        );
    }

    renderEditModal = () => {
        const {
            showEditModal,
            rowHeaders,
            columnHeaders,
            title,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        return (
            <Modal
                className={styles.editModal}
                onClose={this.handleEditModalClose}
            >
                <ModalHeader title={this.props.afStrings('editNumberMatrixModalTitle')} />
                <ModalBody className={styles.body}>
                    <div className={styles.titleInputContainer}>
                        <TextInput
                            label={this.props.afStrings('titleLabel')}
                            placeholder={this.props.afStrings('titlePlaceholderScale')}
                            onChange={this.handleWidgetTitleChange}
                            value={title}
                            showHintAndError={false}
                            autoFocus
                            selectOnFocus
                        />
                    </div>
                    <div className={styles.modalUnitContainer}>
                        <header className={styles.header}>
                            <h3 className={styles.heading}>
                                {this.props.afStrings('rowsLabel')}
                            </h3>
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={() => this.handleAddButtonClick('row')}
                                title={this.props.afStrings('addRowUnitButtonLabel')}
                                transparent
                            />
                        </header>
                        <SortableList
                            className={styles.editList}
                            data={rowHeaders}
                            modifier={this.renderRowUnit}
                            onChange={this.handleRowListSortChange}
                            sortableItemClass={styles.sortableUnit}
                            keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                            dragHandleModifier={this.renderDragHandle}
                        />
                    </div>
                    <div className={styles.modalUnitContainer}>
                        <header className={styles.header}>
                            <h3 className={styles.heading}>
                                {this.props.afStrings('columnsLabel')}
                            </h3>
                            <PrimaryButton
                                iconName={iconNames.add}
                                onClick={() => this.handleAddButtonClick('column')}
                                title={this.props.afStrings('addColumnUnitButtonLabel')}
                                transparent
                            />
                        </header>
                        <SortableList
                            className={styles.editList}
                            data={columnHeaders}
                            modifier={this.renderColumnUnit}
                            onChange={this.handleColumnListSortChange}
                            sortableItemClass={styles.sortableUnit}
                            keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                            dragHandleModifier={this.renderDragHandle}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        onClick={this.handleModalCancelButtonClick}
                    >
                        {this.props.afStrings('cancelButtonLabel')}
                    </Button>
                    <PrimaryButton
                        onClick={this.handleModalSaveButtonClick}
                    >
                        {this.props.afStrings('saveButtonLabel')}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const Matrix = this.renderMatrix;
        const EditModal = this.renderEditModal;

        return (
            <div className={styles.overview}>
                <Matrix />
                <EditModal />
            </div>
        );
    }
}
