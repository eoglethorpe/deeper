import PropTypes from 'prop-types';
import React from 'react';

import WidgetEmptyComponent from '../../../components/WidgetEmptyComponent';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import styles from './styles.scss';

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

@BoundError(WidgetError)
export default class NumberMatrixList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getRowsData = (data, attribute) => {
        const { rowHeaders = emptyList } = data;
        const dataRows = [];

        rowHeaders.forEach((row) => {
            const { columnHeaders = emptyList } = data;
            const columnList = [];

            columnHeaders.forEach((col) => {
                const value = (attribute[row.key] || emptyObject)[col.key];
                const obj = {
                    title: col.title,
                    value: value || '~',
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
            <span className={styles.rowTitle}>
                {data.title}
            </span>
            <ListView
                className={styles.colsContainer}
                data={data.columns}
                modifier={this.renderDataColumns}
                keyExtractor={NumberMatrixList.rowKeyExtractor}
                emptyComponent={WidgetEmptyComponent}
            />
        </div>
    )

    renderDataColumns = (key, data) => (
        <div
            className={styles.col}
            key={key}
        >
            <span>{ data.title }</span>
            <span>{ data.value }</span>
        </div>
    )

    render() {
        const { attribute, data } = this.props;
        const dataRows = this.getRowsData(data, attribute);

        return (
            <ListView
                className={styles.list}
                data={dataRows}
                modifier={this.renderDataRow}
                keyExtractor={NumberMatrixList.rowKeyExtractor}
                emptyComponent={WidgetEmptyComponent}
            />
        );
    }
}
