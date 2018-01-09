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
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {
        rows: [],
    },
};

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

        const data = this.props.data || { rows: [] };

        this.state = {
            showEditModal: false,
            activeRow: data.rows[0] || emptyObject,
            data,
        };

        this.props.editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        const data = nextProps.data || { rows: [] };
        this.setState({
            data,
        });
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

    createFilters = ({ rows }) => {
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

    createExportable = ({ rows }) => {
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
        const { data } = this.state;
        const index = data.rows.findIndex(d => d.key === key);

        this.setState({
            activeRow: data.rows[index],
        });
    }

    handleColorChange = (newColor) => {
        const { activeRow, data } = this.state;
        const rowIndex = data.rows.findIndex(d => d.key === activeRow.key);

        const settings = {
            rows: {
                [rowIndex]: {
                    color: { $set: newColor.hex },
                },
            },
        };

        const newData = update(this.state.data, settings);

        this.setState({
            data: newData,
            activeRow: newData.rows[rowIndex],
        });
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
            this.createFilters(newData),
            this.createExportable(newData),
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
        this.setState({
            data: newData,
            activeRow: newData.rows[0] || emptyObject,
        });
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
        this.setState({
            data: newData,
            activeRow: newData.rows[rowIndex],
        });
    }

    handleTextInputOnFocus = (key) => {
        const { data } = this.state;
        this.setState({
            activeRow: data.rows.find(d => d.key === key),
        });
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
        this.setState({
            data: newData,
            activeRow: newRow,
        });
    }

    handleEdit = () => {
        this.setState({
            showEditModal: true,
            activeRow: this.state.data.rows[0] || emptyObject,
        });
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            data: this.props.data,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({
            showEditModal: false,
        });
        this.props.onChange(
            this.state.data,
            this.createFilters(this.state.data),
            this.createExportable(this.state.data),
        );
    }

    SortableEditRow = SortableElement(({ value: { data, key } }) => (
        <div
            className={this.getActiveSelectionStyle(key)}
            key={key}
        >
            <DragHandle />
            <div className={styles['color-box-container']}>
                <span className={styles['color-label']}>{afStrings.colorLabel}</span>
                <button
                    className={styles['color-box']}
                    onClick={() => this.handleColorBoxClick(key)}
                    style={{ backgroundColor: data.color }}
                />
            </div>
            <TextInput
                className={styles['title-input']}
                label={afStrings.titleLabel}
                onFocus={() => this.handleTextInputOnFocus(key)}
                placeholder={afStrings.optionPlaceholder}
                onChange={value => this.handleRowValueInputChange(key, value, 'title')}
                value={data.title}
            />
            <TextInput
                className={styles['title-input']}
                label={afStrings.tooltipTitle}
                onFocus={() => this.handleTextInputOnFocus(key)}
                placeholder={afStrings.tooltipPlaceholder}
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
            data,
            showEditModal,
            activeRow,
        } = this.state;

        return (
            <div styleName="framework-matrix-1d">
                <ListView
                    data={data.rows}
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
                        { data.rows.length > 0 &&
                            <SketchPicker
                                color={activeRow.color}
                                onChange={this.handleColorChange}
                            />
                        }
                        <this.SortableList
                            items={data.rows}
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
