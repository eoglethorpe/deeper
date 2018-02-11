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

import ColorInput from '../../../../../public/components/Input/ColorInput';
import TextInput from '../../../../../public/components/Input/TextInput';
import Button from '../../../../../public/components/Action/Button';
import PrimaryButton from '../../../../../public/components/Action/Button/PrimaryButton';
import Modal from '../../../../../public/components/View/Modal';
import ModalHeader from '../../../../../public/components/View/Modal/Header';
import ModalBody from '../../../../../public/components/View/Modal/Body';
import ModalFooter from '../../../../../public/components/View/Modal/Footer';
import DangerButton from '../../../../../public/components/Action/Button/DangerButton';
import ListView from '../../../../../public/components/View/List/ListView';

import { iconNames } from '../../../../../common/constants';
import { afStringsSelector } from '../../../../../common/redux';

import MatrixRow from './MatrixRow';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
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

@connect(mapStateToProps)
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
            title: props.title,
            data,
        };

        this.props.editAction(this.handleEdit);
    }

    componentDidMount() {
        const { onChange } = this.props;

        onChange(
            this.state.data,
            this.createFilters(this.state.data),
            this.createExportable(this.state.data),
            this.state.title,
        );
    }

    componentWillReceiveProps(nextProps) {
        const data = nextProps.data || { rows: [] };
        this.setState({ data });
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        const data = { ...this.state.data };
        data.rows = arrayMove(data.rows, oldIndex, newIndex);
        this.setState({ data });
    };

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

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            data: this.props.data,
            title: this.props.title,
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

    render() {
        const {
            data,
            showEditModal,
            title,
        } = this.state;

        return (
            <div styleName="framework-matrix-1d">
                <ListView
                    data={data.rows}
                    className={styles.rows}
                    keyExtractor={Matrix1dOverview.rowKeyExtractor}
                    modifier={this.renderRow}
                />
                { showEditModal &&
                    <Modal styleName="edit-row-modal">
                        <ModalHeader
                            title={this.props.afStrings('editRowModalTitle')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddRowButtonClick}
                                    transparent
                                >
                                    {this.props.afStrings('addRowButtonLabel')}
                                </PrimaryButton>
                            }
                        />
                        <ModalBody styleName="edit-row-body">
                            <div styleName="general-info-container">
                                <TextInput
                                    className={styles['title-input']}
                                    label={this.props.afStrings('titleLabel')}
                                    placeholder={this.props.afStrings('titlePlaceholderScale')}
                                    onChange={this.handleWidgetTitleChange}
                                    value={title}
                                    showHintAndError={false}
                                    autoFocus
                                    selectOnFocus
                                />
                            </div>
                            <div styleName="modal-rows-content">
                                <this.SortableList
                                    items={data.rows}
                                    onSortEnd={this.onSortEnd}
                                    lockAxis="y"
                                    lockToContainerEdges
                                    useDragHandle
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
                }
            </div>
        );
    }
}
