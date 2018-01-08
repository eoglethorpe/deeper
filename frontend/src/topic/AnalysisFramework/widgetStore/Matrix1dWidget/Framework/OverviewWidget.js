import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { SketchPicker } from 'react-color';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';

import MatrixRow from './MatrixRow';

import {
    iconNames,
    afStrings,
} from '../../../../../common/constants';
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

import styles from './styles.scss';

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

const emptyList = [];
const emptyObject = {};

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

        const rows = this.props.data || emptyList;

        this.state = {
            showEditModal: false,
            activeRow: rows[0] || emptyObject,
            rows,
        };

        this.props.editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.rows !== nextProps.data) {
            this.setState({ rows: nextProps.data || emptyList });
        }
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            rows: arrayMove(this.state.rows, oldIndex, newIndex),
        });
    };

    getActiveSelectionStyle = (key) => {
        const { activeRow } = this.state;
        const rowStyle = ['edit-row', 'draggable-item'];
        if (activeRow.key === key) {
            rowStyle.push('active');
        }
        const styleNames = rowStyle.map(d => styles[d]);
        return styleNames.join(' ');
    }

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

    createExportable = (rows) => {
        const excel = {
            type: 'multiple',
            titles: ['Dimension', 'Subdimension'],
        };

        const report = {
            levels: rows.map(row => ({
                id: row.key,
                title: row.title,
                sublevels: row.cells.map(cell => ({
                    id: `${row.key}-${cell.key}`,
                    title: cell.value,
                })),
            })),
        };

        return {
            widgetKey: this.props.widgetKey,
            data: {
                excel,
                report,
            },
        };
    }

    handleColorBoxClick = (key) => {
        const { rows } = this.state;
        const index = rows.findIndex(d => d.key === key);

        this.setState({
            activeRow: rows[index],
        });
    }

    handleColorChange = (newColor) => {
        const { activeRow } = this.state;
        const rowIndex = this.state.rows.findIndex(d => d.key === activeRow.key);

        const settings = {
            [rowIndex]: {
                color: { $set: newColor.hex },
            },
        };

        const newRows = update(this.state.rows, settings);

        this.setState({
            rows: newRows,
            activeRow: newRows[rowIndex],
        });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
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

        this.props.onChange(
            newRows,
            this.createFilters(newRows),
            this.createExportable(newRows),
        );
    }

    handleRowRemoveButtonClick = (key) => {
        const { rows } = this.state;
        const rowIndex = rows.findIndex(d => d.key === key);
        const settings = {
            $splice: [[rowIndex, 1]],
        };
        const newRows = update(rows, settings);
        this.setState({
            rows: newRows,
            activeRow: newRows[0] || emptyObject,
        });
    }

    handleRowValueInputChange = (key, value, name) => {
        const rowIndex = this.state.rows.findIndex(d => d.key === key);
        const settings = {
            [rowIndex]: {
                [name]: { $set: value },
            },
        };
        const newRows = update(this.state.rows, settings);
        this.setState({
            rows: newRows,
            activeRow: newRows[rowIndex],
        });
    }

    handleTextInputOnFocus = (key) => {
        const { rows } = this.state;
        const index = rows.findIndex(d => d.key === key);

        this.setState({
            activeRow: rows[index],
        });
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
        this.setState({
            rows: newRows,
            activeRow: newRow,
        });
    }

    handleEdit = () => {
        this.setState({
            showEditModal: true,
            activeRow: this.state.rows[0] || emptyObject,
        });
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
        this.setState({
            showEditModal: false,
        });
        this.props.onChange(
            this.state.rows,
            this.createFilters(this.state.rows),
            this.createExportable(this.state.rows),
        );
    }

    SortableEditRow = SortableElement(({ value: { data, key } }) => (
        <div
            className={this.getActiveSelectionStyle(key)}
            key={key}
        >
            <DragHandle />
            <div className={styles['color-box-container']}>
                <span className={styles['color-label']}>Color</span>
                <button
                    className={styles['color-box']}
                    onClick={() => this.handleColorBoxClick(key)}
                    style={{ backgroundColor: data.color }}
                />
            </div>
            <TextInput
                className={styles['title-input']}
                label="Title"
                onFocus={() => this.handleTextInputOnFocus(key)}
                placeholder="eg: Context"
                onChange={value => this.handleRowValueInputChange(key, value, 'title')}
                value={data.title}
            />
            <TextInput
                className={styles['title-input']}
                label="Tooltip"
                onFocus={() => this.handleTextInputOnFocus(key)}
                placeholder="I am the context"
                onChange={value => this.handleRowValueInputChange(key, value, 'tooltip')}
                value={data.tooltip}
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
            activeRow,
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
                        title={afStrings.editRowModalTitle}
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleAddRowButtonClick}
                            >
                                {afStrings.addRowButtonLabel}
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody styleName="edit-row-body">
                        { rows.length > 0 &&
                            <SketchPicker
                                color={activeRow.color}
                                onChange={this.handleColorChange}
                            />
                        }
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
                            {afStrings.cancelButtonLabel}
                        </Button>
                        <PrimaryButton
                            onClick={this.handleModalSaveButtonClick}
                        >
                            {afStrings.saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
