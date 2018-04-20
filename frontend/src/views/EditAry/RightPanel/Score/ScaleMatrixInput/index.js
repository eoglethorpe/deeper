import React from 'react';
import PropTypes from 'prop-types';

import List from '../../../../../vendor/react-store/components/View/List';
import FaramElement from '../../../../../vendor/react-store/components/Input/Faram/FaramElement';
import { getColorOnBgColor } from '../../../../../vendor/react-store/utils/common.js';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    rows: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    columns: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    scales: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    scaleValues: PropTypes.object,
    value: PropTypes.number,
    onChange: PropTypes.func,
};
const defaultProps = {
    className: '',
    rows: [],
    columns: [],
    scales: {},
    scaleValues: {},
    value: undefined,
    onChange: () => {},
};

@FaramElement('input')
export default class ScaleMatrixInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static checkAndSetDefaultValue = ({ scales, value, onChange }) => {
        const defaultValue = Object.values(scales)
            .reduce(
                (acc, cols) => Object.values(cols).find(c => c.default) || acc,
                undefined,
            );

        if (!value && defaultValue) {
            onChange(defaultValue.id);
        }
    }

    static getDerivedStateFromProps = (nextProps) => {
        ScaleMatrixInput.checkAndSetDefaultValue(nextProps);

        const {
            rows,
            columns,
        } = nextProps;

        const rowTitles = rows.reduce((acc, row) => {
            acc[row.id] = row.title;
            return acc;
        }, {});

        const columnTitles = columns.reduce((acc, column) => {
            acc[column.id] = column.title;
            return acc;
        }, {});

        return { rowTitles, columnTitles };
    }

    constructor(props) {
        super(props);
        ScaleMatrixInput.checkAndSetDefaultValue(props);

        this.state = {
            rowTitles: {},
            columnTitles: {},
        };
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            'scale-matrix-input',
            styles.scaleMatrixInput,
        ];

        return classNames.join(' ');
    }

    getCellClassName = (id) => {
        const { value } = this.props;

        const classNames = [
            styles.cell,
        ];

        if (value === id) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    handleCellClick = (id) => {
        const {
            value,
            onChange,
        } = this.props;

        if (id !== value) {
            onChange(id);
        }
    }

    renderCell = (rowKey, columnKey) => {
        const {
            scales,
            scaleValues,
        } = this.props;

        const {
            rowTitles,
            columnTitles,
        } = this.state;

        const scale = scales[rowKey][columnKey];
        const scaleValue = scaleValues[scale.value];

        const title = `${rowTitles[rowKey]}\n\n${columnTitles[columnKey]}`;
        const style = {
            backgroundColor: scaleValue.color,
            color: getColorOnBgColor(scaleValue.color),
        };

        const className = this.getCellClassName(scale.id);

        return (
            <td
                className={className}
                title={title}
                style={style}
                key={scale.id}
            >
                <button
                    className={styles.button}
                    onClick={() => { this.handleCellClick(scale.id); }}
                    type="button"
                >
                    { scale.value }
                </button>
            </td>
        );
    }

    renderRow = (kr, row) => {
        const { columns } = this.props;

        return (
            <tr key={row.id}>
                <List
                    data={columns}
                    modifier={(kc, column) => this.renderCell(row.id, column.id)}
                />
            </tr>
        );
    }

    render() {
        const { rows } = this.props;

        const className = this.getClassName();

        return (
            <div className={className}>
                <table>
                    <tbody>
                        <List
                            data={rows}
                            modifier={this.renderRow}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}

