import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles.scss';

import {
    ListView,
} from '../../../../../public/components/View';

import update from '../../../../../public/utils/immutable-update';
import {
    getColorOnBgColor,
} from '../../../../../public/utils/common';

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
            const trStyle = {
                backgroundColor: dimension.color,
                color: getColorOnBgColor(dimension.color),
            };

            return dimension.subdimensions.map((subdimension, i) => (
                <tr
                    style={trStyle}
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
                            <td key={sector.id} />
                        ))
                    }
                </tr>
            ));
        });

        return bodyRowsView;
    }

    render() {
        const {
            id,
        } = this.props;

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

