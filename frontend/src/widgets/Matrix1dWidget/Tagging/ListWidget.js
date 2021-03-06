import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../../../vendor/react-store/components/View/List/ListView';

// import { updateAttribute } from './utils';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';
import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: {},
    data: {},
};

const emptyList = [];

@BoundError(WidgetError)
export default class Matrix1dList extends React.PureComponent {
    static rowKeyExtractor = d => d.title;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            data,
            attribute,
        } = props;
        this.selectedRows = this.getSelectedRowsTitles(data, attribute);
        // updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        const {
            data: newData,
            attribute: newAttribute,
        } = nextProps;

        this.selectedRows = this.getSelectedRowsTitles(newData, newAttribute);

        // const { attribute: oldAttribute } = this.props;
        // if (oldAttribute !== newAttribute) {
        //     updateAttribute(nextProps);
        // }
    }

    getSelectedRowsTitles = (data, attribute) => {
        const { rows = emptyList } = data;
        const selectedRows = [];

        rows.forEach((row) => {
            const attributeRow = attribute[row.key];
            const selectedCells = [];

            if (attributeRow) {
                const { cells = emptyList } = row;
                cells.forEach((cell) => {
                    if (attributeRow[cell.key]) {
                        selectedCells.push({
                            title: cell.value,
                            key: cell.key,
                        });
                    }
                });
            }

            if (selectedCells.length > 0) {
                selectedRows.push({
                    title: row.title,
                    key: row.key,
                    selectedCells,
                });
            }
        });

        return selectedRows;
    }

    renderRowData = (key, data) => (
        <div
            key={key}
            className={styles.row}
        >
            <div className={styles.title}>
                {data.title}
            </div>
            <ListView
                className={styles.cells}
                data={data.selectedCells}
                keyExtractor={Matrix1dList.rowKeyExtractor}
                modifier={this.renderCellData}
            />
        </div>
    )

    renderCellData = (key, data) => {
        const marker = '•';

        return (
            <div
                key={key}
                className={styles.cell}
            >
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    { data.title }
                </div>
            </div>
        );
    }

    render() {
        return (
            <ListView
                className={styles.list}
                data={this.selectedRows}
                keyExtractor={Matrix1dList.rowKeyExtractor}
                modifier={this.renderRowData}
            />
        );
    }
}
