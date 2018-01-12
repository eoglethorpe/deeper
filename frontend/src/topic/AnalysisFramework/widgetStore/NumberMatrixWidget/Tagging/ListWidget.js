import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    ListView,
} from '../../../../../public/components/View';

import styles from './styles.scss';
import { updateAttribute } from './utils';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    attribute: {},
};

const emptyList = [];
const emptyObject = {};

@CSSModules(styles)
export default class NumberMatrixList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            updateAttribute(nextProps);
        }
    }

    getRowsData = (data, attribute) => {
        const dataRows = [];
        (data.rowHeaders || emptyList).forEach((row) => {
            const columnList = [];
            (data.columnHeaders || emptyList).forEach((col) => {
                const value = (attribute[row.key] || emptyObject)[col.key];
                const obj = {
                    title: col.title,
                    value: value || '-',
                    key: col.key,
                };
                columnList.push(obj);
            });
            const rowObj = {
                title: row.title,
                columns: columnList,
                key: row.key,
            };
            dataRows.push(rowObj);
        });

        return dataRows;
    }

    renderDataRow = (key, data) => (
        <div
            className={styles.row}
            key={key}
        >
            <span className={styles['row-title']}>
                {data.title}
            </span>
            <ListView
                className={styles['cols-container']}
                data={data.columns}
                modifier={this.renderDataColumns}
                keyExtractor={NumberMatrixList.rowKeyExtractor}
                emptyComponent="-"
            />
        </div>
    )

    renderDataColumns = (key, data) => (
        <div
            className={styles.col}
            key={key}
        >
            <span className={styles['col-title']}>
                {data.title}
            </span>
            <span className={styles['col-value']}>
                {data.value}
            </span>
        </div>
    )

    render() {
        const { attribute, data } = this.props;
        const dataRows = this.getRowsData(data, attribute);

        return (
            <ListView
                styleName="number-matrix-list"
                data={dataRows}
                modifier={this.renderDataRow}
                keyExtractor={NumberMatrixList.rowKeyExtractor}
                emptyComponent="-"
            />
        );
    }
}
