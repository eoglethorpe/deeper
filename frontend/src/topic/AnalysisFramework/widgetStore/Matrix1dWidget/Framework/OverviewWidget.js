import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';

import MatrixRow from './MatrixRow';

import { iconNames } from '../../../../../common/constants';
import { randomString } from '../../../../../public/utils/common';
import {
    TransparentPrimaryButton,
    TransparentDangerButton,
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
import update from '../../../../../public/utils/immutable-update';

import styles from '../styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: [],
};

const DragHandle = SortableHandle(() => (
    <span className={`${iconNames.hamburger} drag-handle`} />
));

@CSSModules(styles)
export default class Matrix1dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            rows: props.data || [],
        };

        this.props.editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ rows: nextProps.data || [] });
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            rows: arrayMove(this.state.rows, oldIndex, newIndex),
        });
    };

    createFilters = (rows) => {
        const filterOptions = [];
        rows.forEach((row) => {
            filterOptions.push({
                label: row.title,
                key: row.key,
            });

            row.cells.forEach((cell) => {
                filterOptions.push({
                    label: `${row.title} / ${cell.value}`,
                    key: cell.key,
                });
            });
        });

        return [{
            title: this.props.title,
            widgetKey: this.props.widgetKey,
            key: this.props.widgetKey,
            filterType: 'list',
            properties: {
                type: 'multiselect',
                options: filterOptions,
            },
        }];
    }

    handleRowDataChange = (key, cells) => {
        const { rows } = this.state;
        const rowIndex = rows.findIndex(d => d.key === key);
        const settings = {
            [rowIndex]: {
                cells: { $set: cells },
            },
        };
        const newRows = update(rows, settings);
        const filters = this.createFilters(newRows);

        this.props.onChange(newRows, filters);
    }

    handleRowRemoveButtonClick = (key) => {
        const { rows } = this.state;
        const rowIndex = rows.findIndex(d => d.key === key);
        const settings = {
            [rowIndex]: {
                $splice: [[rowIndex, 1]],
            },
        };
        const newRows = update(rows, settings);
        this.setState({ rows: newRows });
    }

    handleRowValueInputChange = (key, value, name) => {
        const rowIndex = this.state.rows.findIndex(d => d.key === key);
        const settings = {
            [rowIndex]: {
                [name]: { $set: value },
            },
        };
        const newRows = update(this.state.rows, settings);
        this.setState({ rows: newRows });
    }

    handleAddRowButtonClick = () => {
        const { rows } = this.state;

        const newRow = {
            key: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
            color: '#000000',
            cells: [],
        };
        const settings = {
            $push: [newRow],
        };
        const newRows = update(rows, settings);
        this.setState({ rows: newRows });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            rows: this.props.data,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const filters = this.createFilters(this.state.rows);
        this.props.onChange(this.state.rows, filters);
    }

    SortableEditRow = SortableElement(({ value: { data, key } }) => (
        <div
            className={`${styles['edit-row']} ${styles['draggable-item']}`}
            key={key}
        >
            <DragHandle />
            <TextInput
                className={styles['title-input']}
                label="Title"
                placeholder="eg: Context"
                onChange={value => this.handleRowValueInputChange(key, value, 'title')}
                value={data.title}
            />
            <TextInput
                className={styles['title-input']}
                label="Tooltip"
                placeholder="I am the context"
                onChange={value => this.handleRowValueInputChange(key, value, 'tooltip')}
                value={data.tooltip}
            />
            <input
                type="color"
                onChange={e => this.handleRowValueInputChange(key, e.target.value, 'color')}
                value={data.color}
            />
            <TransparentDangerButton
                className={styles['delete-button']}
                onClick={() => this.handleRowRemoveButtonClick(key)}
            >
                <span className={iconNames.delete} />
            </TransparentDangerButton>
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

    render() {
        const {
            rows,
            showEditModal,
        } = this.state;

        return (
            <div styleName="framework-matrix-1d">
                <ListView
                    data={rows}
                    className={styles.rows}
                    keyExtractor={Matrix1dOverview.rowKeyExtractor}
                    modifier={this.renderRow}
                />
                <Modal
                    styleName="edit-row-modal"
                    show={showEditModal}
                    onClose={this.handleEditModalClose}
                >
                    <ModalHeader
                        title="Edit row"
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleAddRowButtonClick}
                            >
                                Add row
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody>
                        <this.SortableList
                            items={rows}
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
