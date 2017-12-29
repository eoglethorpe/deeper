import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import {
    ListView,
} from '../../../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object,      // eslint-disable-line
    data: PropTypes.array,      // eslint-disable-line
};

const defaultProps = {
    attribute: {},
    data: [],
};

const emptyList = [];

@CSSModules(styles)
export default class Matrix1dList extends React.PureComponent {
    static rowKeyExtractor = d => d.title;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getSelectedRowsTitles = (data, attribute) => {
        const selectedRows = [];
        data.forEach((row) => {
            const selectedCells = [];
            const attributeRow = attribute[row.key];

            if (attributeRow) {
                row.cells.forEach((cell) => {
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
            <span className={styles['row-title']}>{data.title}</span>
            <ListView
                className={styles.cell}
                data={data.selectedCells || emptyList}
                keyExtractor={Matrix1dList.rowKeyExtractor}
                modifier={this.renderCellData}
            />
        </div>
    )

    renderCellData = (key, data) => (
        <span
            key={key}
            className={styles.cell}
        >
            {data.title}
        </span>
    )

    render() {
        const { data, attribute } = this.props;
        const selectedRows = this.getSelectedRowsTitles(data, attribute);

        return (
            <div styleName="matrix-1d-list">
                <ListView
                    styleName="list"
                    data={selectedRows || emptyList}
                    keyExtractor={Matrix1dList.rowKeyExtractor}
                    modifier={this.renderRowData}
                />
            </div>
        );
    }
}
