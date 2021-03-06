import PropTypes from 'prop-types';
import React from 'react';

import update from '../../../vendor/react-store/utils/immutable-update';
import NumberInput from '../../../vendor/react-store/components/Input/NumberInput';
import List from '../../../vendor/react-store/components/View/List';
import BoundError from '../../../vendor/react-store/components/General/BoundError';

import WidgetError from '../../../components/WidgetError';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    attribute: {},
};

const emptyList = [];
const emptyObject = {};

@BoundError(WidgetError)
export default class NumberMatrixOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    onChangeNumberField = (rowKey, colKey, value) => {
        const { api, id } = this.props;
        const { attribute } = this.props;
        const settings = {
            [rowKey]: { $auto: {
                [colKey]: { $set: value },
            } },
        };
        const newAttribute = update(attribute, settings);

        api.getEntryModifier()
            .setAttribute(id, newAttribute)
            .apply();
    }

    getSimilarityIndicatorStyle = (key) => {
        const { data, attribute } = this.props;
        const indicatorStyle = [styles.tableHeaderRow];

        const values = Object.values(attribute[key] || emptyObject).filter(v => v);

        const isSame = new Set(values).size === 1;
        const colHeaderLength = (data.columnHeaders || emptyList).length;

        if (isSame && values.length === colHeaderLength) {
            indicatorStyle.push(styles.similar);
        } else if (!isSame && values.length === colHeaderLength) {
            indicatorStyle.push(styles.notSimilar);
        } else {
            indicatorStyle.push(styles.partialSimilar);
        }

        return indicatorStyle.join(' ');
    }

    renderRow = (key, rowData) => {
        const { data } = this.props;
        return (
            <tr key={key} >
                <th
                    className={this.getSimilarityIndicatorStyle(key)}
                    scope="row"
                    title={rowData.tooltip}
                >
                    {rowData.title}
                </th>
                <List
                    data={data.columnHeaders || emptyList}
                    modifier={(colKey, colData) => this.renderColElement(colKey, colData, key)}
                    keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                />
            </tr>
        );
    }

    renderColHeader = (key, data) => (
        <th
            className={styles.tableHeader}
            scope="col"
            key={key}
            title={data.tooltip}
        >
            {data.title}
        </th>
    )

    renderColElement = (key, data, rowKey) => {
        const { attribute } = this.props;
        const value = (attribute[rowKey] || emptyObject)[key];

        return (
            <td
                className={styles.tableCell}
                key={`${rowKey}-${key}`}
            >
                <NumberInput
                    placeholder={_ts('af', 'numberPlaceholder')}
                    showLabel={false}
                    onChange={newValue => this.onChangeNumberField(rowKey, key, newValue)}
                    value={value}
                    showHintAndError={false}
                    separator=" "
                />
            </td>
        );
    }

    render() {
        const { data } = this.props;
        return (
            <div className={styles.overview}>
                <table>
                    <tbody>
                        <tr>
                            <td />
                            <List
                                data={data.columnHeaders || emptyList}
                                modifier={this.renderColHeader}
                                keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                            />
                        </tr>
                        <List
                            data={data.rowHeaders || emptyList}
                            modifier={this.renderRow}
                            keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}
