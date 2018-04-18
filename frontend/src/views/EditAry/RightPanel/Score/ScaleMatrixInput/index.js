import React from 'react';
import PropTypes from 'prop-types';

import List from '../../../../../vendor/react-store/components/View/List';
import { getColorOnBgColor } from '../../../../../vendor/react-store/utils/common.js';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    rows: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    columns: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.object,
    value: PropTypes.number,
    onChange: PropTypes.func,
};
const defaultProps = {
    className: '',
    rows: [],
    columns: [],
    options: {},
    value: '',
    onChange: () => {},
};

export default class ScaleMatrixInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static getDerivedStateFromProps = (nextProps) => {
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

    state = {
        rowTitles: {},
        columnTitles: {},
    };

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
        const { options } = this.props;

        const {
            rowTitles,
            columnTitles,
        } = this.state;

        const data = options[rowKey][columnKey];
        const title = `${rowTitles[rowKey]}\n\n${columnTitles[columnKey]}`;
        const style = {
            backgroundColor: data.color,
            color: getColorOnBgColor(data.color),
        };

        const className = this.getCellClassName(data.id);

        return (
            <td
                className={className}
                title={title}
                style={style}
                key={data.id}
            >
                <button
                    className={styles.button}
                    onClick={() => { this.handleCellClick(data.id); }}
                    type="button"
                >
                    { data.score }
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
        const {
            rows,
        } = this.props;

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

