import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { randomString } from '../../../vendor/react-store/utils/common';
import update from '../../../vendor/react-store/utils/immutable-update';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import SortableList from '../../../vendor/react-store/components/View/SortableList';

import { iconNames } from '../../../constants';
import { afStringsSelector } from '../../../redux';

import MatrixCell from './MatrixCell';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    title: undefined,
    onChange: undefined,
    selectedCells: {},
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
export default class MatrixRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static cellKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            cells: props.cells,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.cells !== nextProps.cells) {
            this.setState({ cells: nextProps.cells });
        }
    }

    handleCellSortEnd = (cells) => {
        this.setState({ cells });
    }

    handleCellRemoveButtonClick = (key) => {
        const cellIndex = this.state.cells.findIndex(d => d.key === key);
        const settings = {
            $splice: [[cellIndex, 1]],
        };
        const newCells = update(this.state.cells, settings);
        this.setState({ cells: newCells });
    }

    handleCellValueInputChange = (key, value) => {
        const cellIndex = this.state.cells.findIndex(d => d.key === key);
        const settings = {
            [cellIndex]: {
                value: { $set: value },
            },
        };
        const newCells = update(this.state.cells, settings);
        this.props.onChange(newCells);
    }

    handleEditButtonClick = () => {
        this.setState({ showEditModal: true });
    }

    handleAddCellButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const newCell = {
            key: randomString(16).toLowerCase(),
            value: '',
        };
        const settings = {
            $push: [newCell],
        };
        const newCells = update(this.state.cells, settings);

        this.setState({ cells: newCells });
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            cells: this.props.cells,
            showEditModal: false,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        this.props.onChange(this.state.cells);
    }

    renderEditCell = (key, data) => (
        <div
            className={`${styles['edit-cell']} ${styles['draggable-item']}`}
            key={key}
        >
            <TextInput
                className={styles['title-input']}
                label={this.props.afStrings('titleLabel')}
                placeholder={this.props.afStrings('titlePlaceholderOverview')}
                onChange={value => this.handleCellValueInputChange(key, value)}
                value={data.value}
                autoFocus
            />
            <DangerButton
                className={styles['delete-button']}
                onClick={() => this.handleCellRemoveButtonClick(key)}
                transparent
            >
                <span className={iconNames.delete} />
            </DangerButton>
        </div>
    )

    renderCell = (key, data) => (
        <MatrixCell key={key}>
            { data.value }
        </MatrixCell>
    )

    renderEditModal = () => {
        const {
            cells,
            showEditModal,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const { afStrings } = this.props;

        const headerTitle = afStrings('matrix1DModalTitle');
        const addCellButtonLabel = afStrings('addCellButtonLabel');
        const cancelButtonLabel = afStrings('cancelButtonLabel');
        const saveButtonLabel = afStrings('saveButtonLabel');

        let additionalStyle = '';

        if (cells.length === 0) {
            additionalStyle = styles['no-items'];
        }

        return (
            <Modal
                onMouseDown={this.handleModalMouseDown}
                className={styles['edit-cell-modal']}
                onClose={this.handleEditModalClose}
            >
                <ModalHeader
                    title={headerTitle}
                    rightComponent={
                        <PrimaryButton
                            iconName={iconNames.add}
                            onClick={this.handleAddCellButtonClick}
                        >
                            { addCellButtonLabel }
                        </PrimaryButton>
                    }
                />
                <ModalBody className={styles['edit-cell-body']}>
                    <SortableList
                        className={`${styles['cell-list']} ${additionalStyle}`}
                        data={cells}
                        modifier={this.renderEditCell}
                        onChange={this.handleCellSortEnd}
                        keyExtractor={MatrixRow.cellKeyExtractor}
                    />
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
        const { cells } = this.state;
        const EditModal = this.renderEditModal;
        const { title } = this.props;

        return (
            <div className={styles['matrix-row']}>
                <div className={styles.title}>
                    { title }
                </div>
                <ListView
                    data={cells}
                    className={styles.cells}
                    keyExtractor={MatrixRow.cellKeyExtractor}
                    modifier={this.renderCell}
                />
                <div className={styles['action-buttons']}>
                    <PrimaryButton
                        onClick={this.handleEditButtonClick}
                        transparent
                        smallVerticalPadding
                        iconName={iconNames.edit}
                    />
                </div>
                <EditModal />
            </div>
        );
    }
}
