import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';


import {
    ListView,
} from '../../../../../public/components/View';

import { updateAttribute } from './utils';
import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: {},
    data: {},
};

@CSSModules(styles)
export default class Matrix1dList extends React.PureComponent {
    static rowKeyExtractor = d => d.title;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.selectedRows = this.getSelectedRowsTitles(props.data, props.attribute);
        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        this.selectedRows = this.getSelectedRowsTitles(nextProps.data, nextProps.attribute);
        if (this.props.attribute !== nextProps.attribute) {
            updateAttribute(nextProps);
        }
    }

    getSelectedRowsTitles = (data, attribute) => {
        const selectedRows = [];
        data.rows.forEach((row) => {
            const attributeRow = attribute[row.key];
            const selectedCells = [];

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
                className={styles['cell-container']}
                data={data.selectedCells}
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
        return (
            <div styleName="matrix-1d-list">
                <ListView
                    styleName="list"
                    data={this.selectedRows}
                    keyExtractor={Matrix1dList.rowKeyExtractor}
                    modifier={this.renderRowData}
                />
            </div>
        );
    }
}
