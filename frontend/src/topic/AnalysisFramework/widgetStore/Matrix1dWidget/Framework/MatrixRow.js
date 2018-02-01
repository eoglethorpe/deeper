import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';
import { connect } from 'react-redux';

import { randomString } from '../../../../../public/utils/common';
import update from '../../../../../public/utils/immutable-update';
import {
    DangerButton,
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

import { iconNames } from '../../../../../common/constants';
import { afStringsSelector } from '../../../../../common/redux';


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

const DragHandle = SortableHandle(() => (
    <span className={`${iconNames.hamburger} drag-handle`} />
));

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
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
        if (this.props.cells !== nextProps.cells) {
            this.setState({ cells: nextProps.cells });
        }
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            cells: arrayMove(this.state.cells, oldIndex, newIndex),
        });
    };

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

    SortableList = SortableContainer(({ items: cells }) => {
        let additionalStyle = '';

        if (cells.length === 0) {
            additionalStyle = styles['no-items'];
        }

        return (
            <ListView
                data={cells}
                className={`${styles['cell-list']} ${additionalStyle}`}
                keyExtractor={MatrixRow.cellKeyExtractor}
                modifier={this.renderEditCell}
            />
        );
    })

    SortableEditCell = SortableElement(({ value: { data, key } }) => (
        <div
            className={`${styles['edit-cell']} ${styles['draggable-item']}`}
            key={key}
        >
            <DragHandle />
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
    ))

    renderEditCell = (key, data, index) => (
        <this.SortableEditCell key={key} index={index} value={{ key, data }} />
    )

    renderCell = (key, data) => (
        <MatrixCell key={key}>
            { data.value }
        </MatrixCell>
    )

    render() {
        const {
            cells,
            showEditModal,
        } = this.state;

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
                    modifier={this.renderCell}
                />
                <div
                    key="action-buttons"
                    styleName="action-buttons"
                >
                    <PrimaryButton
                        onClick={this.handleEditButtonClick}
                        transparent
                    >
                        <span className={iconNames.edit} />
                    </PrimaryButton>
                </div>
                { showEditModal &&
                    <Modal
                        key="modal"
                        onMouseDown={this.handleModalMouseDown}
                        styleName="edit-cell-modal"
                        onClose={this.handleEditModalClose}
                    >
                        <ModalHeader
                            title={this.props.afStrings('matrix1DModalTitle')}
                            rightComponent={
                                <PrimaryButton
                                    iconName={iconNames.add}
                                    onClick={this.handleAddCellButtonClick}
                                >
                                    {this.props.afStrings('addCellButtonLabel')}
                                </PrimaryButton>
                            }
                        />
                        <ModalBody styleName="edit-cell-body">
                            <this.SortableList
                                items={cells}
                                onSortEnd={this.onSortEnd}
                                lockAxis="y"
                                lockToContainerEdges
                                useDragHandle
                            />
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
                }
            </div>
        );
    }
}
