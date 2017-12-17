import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from '../styles.scss';

import { iconNames } from '../../../../../common/constants';

import { randomString } from '../../../../../public/utils/common';
import MatrixCell from './MatrixCell';
import {
    TransparentButton,
    TransparentPrimaryButton,
    PrimaryButton,
    Button,
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

import {
    MODE_EDIT,
    MODE_VIEW,
} from './constants';

const propTypes = {
    title: PropTypes.string,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onCellClick: PropTypes.func,
    onCellDrop: PropTypes.func,
    mode: PropTypes.string,
    selectedCells: PropTypes.objectOf(PropTypes.bool),
};

const defaultProps = {
    title: undefined,
    mode: MODE_VIEW,
    onChange: undefined,
    onCellClick: undefined,
    onCellDrop: undefined,
    selectedCells: {},
};


@CSSModules(styles)
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
        this.setState({
            cells: nextProps.cells,
        });
    }

    getEditCell = (key, data) => (
        <div
            className={styles['edit-cell']}
            key={key}
        >
            <TextInput
                label="Title"
                placeholder="eg: Overview"
                onChange={(value) => { this.handleCellValueInputChange(key, value); }}
                value={data.value}
            />
            <TransparentButton
                onClick={() => { this.handleCellRemoveButtonClick(key); }}
            >
                <span className={iconNames.delete} />
            </TransparentButton>
        </div>
    )

    getCell = (key, data) => (
        <MatrixCell
            key={key}
            mode={this.props.mode}
            onClick={() => this.handleCellClick(key)}
            onDrop={(text) => { this.handleCellDrop(key, text); }}
            active={this.props.selectedCells[key]}
        >
            { data.value }
        </MatrixCell>
    )

    handleCellClick = (key) => {
        this.props.onCellClick(key);
    }

    handleCellDrop = (key, text) => {
        this.props.onCellDrop(key, text);
    }

    handleCellRemoveButtonClick = (key) => {
        const newCells = [...this.state.cells];

        const cellIndex = newCells.findIndex(d => d.key === key);
        newCells.splice(cellIndex, 1);

        this.setState({
            cells: newCells,
        });
    }

    handleCellValueInputChange = (key, value) => {
        const newCells = [...this.state.cells];

        const cellIndex = newCells.findIndex(d => d.key === key);
        newCells[cellIndex].value = value;

        this.props.onChange(newCells);
    }

    handleEditButtonClick = () => {
        this.setState({ showEditModal: true });
    }

    handleAddCellButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addCell();
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
        this.setState({
            showEditModal: false,
        });

        this.props.onChange(this.state.cells);
    }

    addCell = () => {
        const newCell = {
            key: randomString(16).toLowerCase(),
            value: '',
        };

        this.setState({
            cells: [
                ...this.state.cells,
                newCell,
            ],
        });
    }

    render() {
        const {
            cells,
            showEditModal,
        } = this.state;

        const {
            mode,
        } = this.props;

        return (
            <div
                styleName="matrix-row"
            >
                <div styleName="title">
                    { this.props.title }
                </div>
                <ListView
                    data={cells}
                    className={styles.cells}
                    keyExtractor={MatrixRow.cellKeyExtractor}
                    modifier={this.getCell}
                />
                {
                    mode === MODE_EDIT && ([
                        <div
                            key="action-buttons"
                            styleName="action-buttons"
                        >
                            <TransparentButton
                                onClick={this.handleEditButtonClick}
                            >
                                <span className={iconNames.edit} />
                            </TransparentButton>
                        </div>,
                        <Modal
                            key="modal"
                            onMouseDown={this.handleModalMouseDown}
                            styleName="edit-cell-modal"
                            show={showEditModal}
                            onClose={this.handleEditModalClose}
                        >
                            <ModalHeader
                                title="Add / edit cell"
                                rightComponent={
                                    <TransparentPrimaryButton
                                        onClick={this.handleAddCellButtonClick}
                                    >
                                        Add cell
                                    </TransparentPrimaryButton>
                                }
                            />
                            <ModalBody>
                                <ListView
                                    data={cells}
                                    className={styles['cell-list']}
                                    keyExtractor={MatrixRow.cellKeyExtractor}
                                    modifier={this.getEditCell}
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
                        </Modal>,
                    ])
                }
            </div>
        );
    }
}
