import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import update from '../../../../../public/utils/immutable-update';
import { getColorOnBgColor } from '../../../../../public/utils/common';

import { updateAttribute } from './utils';
import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
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
        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.setState({
                rows: nextProps.data || [],
            });
        }
        if (this.props.attribute !== nextProps.attribute) {
            updateAttribute(nextProps);
        }
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
            .apply();
    }

    handleCellDrop = (dimensionId, subdimensionId, sectorId, color, e) => {
        const data = e.dataTransfer.getData('text');
        let formattedData;

        try {
            formattedData = JSON.parse(data);
        } catch (ex) {
            formattedData = {
                type: 'excerpt',
                data,
            };
        }

        const {
            api,
            id,
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

