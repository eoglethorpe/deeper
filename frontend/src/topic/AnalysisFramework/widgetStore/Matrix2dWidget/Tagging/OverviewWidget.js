import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles.scss';

import update from '../../../../../public/utils/immutable-update';
import { getColorOnBgColor } from '../../../../../public/utils/common';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    data: {},
    attribute: undefined,
};

const invertHexColor = (color) => {
    const currentColor = parseInt(color.substr(1), 16);
    const maxColor = 0xffffff;

    return `#${(maxColor - currentColor).toString(16)}`;
};

@CSSModules(styles)
export default class Matrix2dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            data: props.data || {},
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            rows: nextProps.data || {},
        });
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

    handleCellDrop = (dimensionId, subdimensionId, sectorId, color, e) => {
        const text = e.dataTransfer.getData('text/plain');

        const {
            api,
            id,
            // filters,
        } = this.props;
        const existing = api.getEntryForExcerpt(text);

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
            // .setFilterData(filters[0].id, this.getFilterData(attribute))
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
                .setExcerpt(text)
                .addAttribute(id, attribute)
            // .addFilterData(filters[0].id, this.getFilterData(attribute))
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
                backgroundColor: invertHexColor(dimension.color),
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

