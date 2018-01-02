import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

import {
    ListView,
} from '../../../../../public/components/View';

import update from '../../../../../public/utils/immutable-update';

import MatrixRow from './MatrixRow';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    exportable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    data: [],
    attribute: undefined,
};

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
    }

    componentWillReceiveProps(nextProps) {
        const { api, attribute, data } = nextProps;

        if (this.props.data !== data) {
            this.setState({
                rows: data || [],
            });
        }
        if (this.props.attribute !== attribute) {
            api.getEntryModifier()
                .setHighlightColor(this.createHighlightColor(attribute))
                .apply();
        }
    }

    createFilterData = (attribute) => {
        const filterValues = [];

        Object.keys(attribute).forEach((key) => {
            const row = attribute[key];

            let rowExists = false;
            Object.keys(row).forEach((cellKey) => {
                if (row[cellKey]) {
                    rowExists = true;
                    filterValues.push(cellKey);
                }
            });

            if (rowExists) {
                filterValues.push(key);
            }
        });

        return {
            values: filterValues,
            number: undefined,
        };
    }

    createHighlightColor = (attribute) => {
        let color;
        Object.keys(attribute || {}).forEach((key) => {
            const row = attribute[key];

            const rowExists = Object.keys(row).reduce((acc, k) => acc || row[k], false);
            if (rowExists) {
                color = this.props.data.find(d => d.key === key).color;
            }
        });

        return color;
    }

    createExportData = (attribute) => {
        const excelValues = [];
        const reportValues = [];

        Object.keys(attribute).forEach((key) => {
            const row = attribute[key];
            const rowData = this.props.data.find(r => r.key === key);

            Object.keys(row).forEach((cellKey) => {
                if (row[cellKey]) {
                    const cellData = rowData.cells.find(c => c.key === cellKey);

                    excelValues.push([rowData.title, cellData.value]);
                    reportValues.push(`${key}-${cellKey}`);
                }
            });
        });

        return {
            excel: {
                type: 'lists',
                values: excelValues,
            },
            report: {
                keys: reportValues,
            },
        };
    }

    handleCellClick = (key, cellKey) => {
        const { api, id, filters, exportable, attribute } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: {
                    $apply: item => !item,
                },
            } },
        } };

        const newAttribute = update(attribute, settings);

        // TODO: complicated cellApplied
        // const cellApplied = !!newAttribute[key][cellKey];

        api.getEntryModifier()
            .setAttribute(id, newAttribute)
            .setFilterData(filters[0].id, this.createFilterData(newAttribute))
            .setExportData(exportable.id, this.createExportData(newAttribute))
            .apply();
    }

    handleCellDrop = (key, cellKey, droppedData) => {
        const { api, id, filters, exportable } = this.props;
        const existing = api.getEntryForData(droppedData);

        if (existing) {
            const settings = { $auto: {
                [key]: { $auto: {
                    [cellKey]: {
                        $set: true,
                    },
                } },
            } };

            const attribute = update(api.getEntryAttribute(id, existing.data.id), settings);

            api.selectEntry(existing.data.id);
            api.getEntryModifier(existing.data.id)
                .setAttribute(id, attribute)
                .setFilterData(filters[0].id, this.createFilterData(attribute))
                .setExportData(exportable.id, this.createExportData(attribute))
                .apply();
        } else {
            const attribute = {
                [key]: {
                    [cellKey]: true,
                },
            };
            api.getEntryBuilder()
                .setData(droppedData)
                .addAttribute(id, attribute)
                .addFilterData(filters[0].id, this.createFilterData(attribute))
                .addExportData(exportable.id, this.createExportData(attribute))
                .apply();
        }
    }

    renderRow = (key, data) => (
        <MatrixRow
            key={key}
            title={data.title}
            tooltip={data.tooltip}
            cells={data.cells}
            onCellClick={cellKey => this.handleCellClick(key, cellKey)}
            onCellDrop={(cellKey, droppedData) => this.handleCellDrop(key, cellKey, droppedData)}
            selectedCells={this.props.attribute ? this.props.attribute[key] : {}}
        />
    )

    render() {
        const {
            rows,
        } = this.state;

        return (
            <div styleName="tagging-matrix-1d">
                <ListView
                    data={rows}
                    className={styles.rows}
                    keyExtractor={Matrix1dOverview.rowKeyExtractor}
                    modifier={this.renderRow}
                />
            </div>
        );
    }
}

