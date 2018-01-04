import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

import update from '../../../../../public/utils/immutable-update';
import { getColorOnBgColor } from '../../../../../public/utils/common';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    exportable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    data: {},
    attribute: undefined,
};

@CSSModules(styles)
export default class Matrix2dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const color = this.getHighlightColor(props.attribute);

        if (color) {
            props.api.getEntryModifier()
                .setHighlightColor(color)
                .apply();
        }
    }

    componentWillReceiveProps(nextProps) {
        const { api, attribute, data } = nextProps;

        if (this.props.data !== data) {
            this.setState({
                rows: data || [],
            });
        }
        if (this.props.attribute !== attribute) {
            const color = this.getHighlightColor(attribute);

            if (color) {
                api.getEntryModifier()
                    .setHighlightColor(color)
                    .apply();
            }
        }
    }

    getHighlightColor = (attribute) => {
        const keys = Object.keys(attribute || {});

        if (keys.length > 0) {
            const { dimensions } = this.props.data;
            const dimension = dimensions && dimensions.find(d => d.id === keys[0]);
            return dimension && dimension.color;
        }

        return undefined;
    }

    createDimensionFilterData = (attribute) => {
        const filterValues = [];
        Object.keys(attribute).forEach((key) => {
            const dimension = attribute[key];
            let dimensionExists = false;

            Object.keys(dimension).forEach((subKey) => {
                if (Object.values(dimension[subKey].length > 0)) {
                    filterValues.push(subKey);
                    dimensionExists = true;
                }
            });

            if (dimensionExists) {
                filterValues.push(key);
            }
        });


        return {
            values: filterValues,
            number: undefined,
        };
    }

    createSectorFilterData = (attribute) => {
        const filterValues = [];
        Object.keys(attribute).forEach((key) => {
            const dimension = attribute[key];

            Object.keys(dimension).forEach((subKey) => {
                const subdimension = dimension[subKey];

                Object.keys(subdimension).forEach((sectorKey) => {
                    const subsectors = subdimension[sectorKey];
                    if (subsectors) {
                        if (filterValues.indexOf(sectorKey) === -1) {
                            filterValues.push(sectorKey);
                        }

                        filterValues.push(...subsectors);
                    }
                });
            });
        });

        return {
            values: filterValues,
            number: undefined,
        };
    }

    createExportData = (attribute) => {
        const excelValues = [];
        const reportValues = [];

        Object.keys(attribute).forEach((key) => {
            const dimension = attribute[key];
            const dimensionData = this.props.data.dimensions.find(d => d.id === key);
            if (!dimensionData) {
                return;
            }

            Object.keys(dimension).forEach((subKey) => {
                const subdimension = dimension[subKey];
                const subdimensionData = dimensionData.subdimensions.find(d => d.id === subKey);

                Object.keys(subdimension).forEach((sectorKey) => {
                    const sectorData = this.props.data.sectors.find(s => s.id === sectorKey);
                    const subsectors = subdimension[sectorKey];

                    if (subsectors) {
                        excelValues.push([
                            dimensionData.title,
                            subdimensionData.title,
                            sectorData.title,
                            subsectors.map(ss => sectorData.subsectors.find(sd => sd.id === ss)).join(','),
                        ]);
                        reportValues.push(`${sectorKey}-${key}-${subKey}`);
                    }
                });
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

    isCellActive = (dimensionId, subdimensionId, sectorId) => {
        const {
            attribute,
        } = this.props;
        const subsectors = attribute && (
            (attribute[dimensionId] || {})[subdimensionId] || {}
        )[sectorId];

        return !!subsectors;
    }

    handleCellClick = (dimensionId, subdimensionId, sectorId) => {
        const {
            attribute,
            api,
            id,
            filters,
            exportable,
        } = this.props;

        let settings;
        if (this.isCellActive(dimensionId, subdimensionId, sectorId)) {
            settings = { $auto: {
                [dimensionId]: { $auto: {
                    [subdimensionId]: { $auto: {
                        $unset: [sectorId],
                    } },
                } },
            } };
        } else {
            settings = { $auto: {
                [dimensionId]: { $auto: {
                    [subdimensionId]: { $auto: {
                        [sectorId]: { $auto: {
                            $set: [],
                        } },
                    } },
                } },
            } };
        }

        const newAttribute = update(attribute, settings);

        api.getEntryModifier()
            .setAttribute(id, newAttribute)
            .setFilterData(filters[0].id, this.createDimensionFilterData(newAttribute))
            .setFilterData(filters[1].id, this.createSectorFilterData(newAttribute))
            .setExportData(exportable.id, this.createExportData(newAttribute))
            .apply();
    }

    handleCellDrop = (dimensionId, subdimensionId, sectorId, color, e) => {
        const data = e.dataTransfer.getData('text');
        let formattedData;

        try {
            formattedData = JSON.parse(data);
        } catch (ex) {
            formattedData = {
                type: 'text',
                data,
            };
        }

        const {
            api,
            id,
            filters,
            exportable,
        } = this.props;
        const existing = api.getEntryForData(formattedData);

        if (existing) {
            const settings = { $auto: {
                [dimensionId]: { $auto: {
                    [subdimensionId]: { $auto: {
                        [sectorId]: { $auto: {
                            $set: [],
                        } },
                    } },
                } },
            } };

            const attribute = update(api.getEntryAttribute(id, existing.data.id), settings);

            api.selectEntry(existing.data.id);
            api.getEntryModifier(existing.data.id)
                .setAttribute(id, attribute)
                .setFilterData(filters[0].id, this.createDimensionFilterData(attribute))
                .setFilterData(filters[1].id, this.createSectorFilterData(attribute))
                .setExportData(exportable.id, this.createExportData(attribute))
                .apply();
        } else {
            const attribute = {
                [dimensionId]: {
                    [subdimensionId]: {
                        [sectorId]: [],
                    },
                },
            };
            api.getEntryBuilder()
                .setData(formattedData)
                .addAttribute(id, attribute)
                .addFilterData(filters[0].id, this.createDimensionFilterData(attribute))
                .addFilterData(filters[1].id, this.createSectorFilterData(attribute))
                .addExportData(exportable.id, this.createExportData(attribute))
                .apply();
        }
    }

    handleCellDragover = (e) => {
        e.preventDefault();
    }

    renderHeadRow = () => {
        const {
            sectors,
        } = this.props.data;

        const renderSectors = [
            { id: 'blank1', title: '' },
            { id: 'blank2', title: '' },
            ...sectors,
        ];

        const headRowView = (
            renderSectors.map(sector => (
                <th
                    key={sector.id}
                    className={styles.sector}
                >
                    {sector.title}
                </th>
            ))
        );

        return headRowView;
    }

    renderBodyRows = () => {
        const {
            dimensions,
            sectors,
        } = this.props.data;

        const bodyRowsView = dimensions.map((dimension) => {
            const rowStyle = {
                backgroundColor: dimension.color,
                color: getColorOnBgColor(dimension.color),
            };

            const activeCellStyle = {
                background: `repeating-linear-gradient(
                    -60deg,
                    ${rowStyle.backgroundColor} 0,
                    ${rowStyle.color} 1px,
                    ${rowStyle.color} 1px,
                    ${rowStyle.backgroundColor} 2px,
                    ${rowStyle.backgroundColor} 10px
                )`,
            };

            return dimension.subdimensions.map((subdimension, i) => (
                <tr
                    style={rowStyle}
                    key={subdimension.id}
                >
                    {i === 0 && (
                        <td
                            rowSpan={dimension.subdimensions.length}
                            className={styles.dimension}
                            title={dimension.tooltip}
                        >
                            {dimension.title}
                        </td>
                    )}
                    <td
                        className={styles.subdimension}
                        title={subdimension.tooltip}
                    >
                        {subdimension.title}
                    </td>
                    {
                        sectors.map(sector => (
                            <td
                                role="gridcell"
                                onDrop={(e) => {
                                    this.handleCellDrop(
                                        dimension.id,
                                        subdimension.id,
                                        sector.id,
                                        dimension.color,
                                        e,
                                    );
                                }}
                                onDragOver={this.handleCellDragover}
                                onClick={() =>
                                    this.handleCellClick(
                                        dimension.id,
                                        subdimension.id,
                                        sector.id,
                                        dimension.color,
                                    )
                                }
                                key={sector.id}
                                style={
                                    this.isCellActive(
                                        dimension.id,
                                        subdimension.id,
                                        sector.id,
                                    ) ? activeCellStyle : {}
                                }
                            />
                        ))
                    }
                </tr>
            ));
        });

        return bodyRowsView;
    }

    render() {
        return (
            <div styleName="tagging-matrix-2d-overview">
                <table styleName="table">
                    <thead>
                        <tr>
                            { this.renderHeadRow() }
                        </tr>
                    </thead>
                    <tbody>
                        { this.renderBodyRows() }
                    </tbody>
                </table>
            </div>
        );
    }
}

