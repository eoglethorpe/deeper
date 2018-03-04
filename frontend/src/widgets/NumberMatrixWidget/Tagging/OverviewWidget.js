import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../../vendor/react-store/utils/immutable-update';
import NumberInput from '../../../vendor/react-store/components/Input/NumberInput';
import List from '../../../vendor/react-store/components/View/List';
import BoundError from '../../../components/BoundError';

import { afStringsSelector } from '../../../redux';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: {},
    attribute: {},
};

const emptyList = [];
const emptyObject = {};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
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
        const indicatorStyle = [styles['table-header-row']];

        const values = Object.values(attribute[key] || emptyObject).filter(v => v);

        const isSame = new Set(values).size === 1;
        const colHeaderLength = (data.columnHeaders || emptyList).length;

        if (values.length === 0 || (isSame && values.length === colHeaderLength)) {
            indicatorStyle.push(styles.similar);
        } else if (!isSame) {
            indicatorStyle.push(styles['not-similar']);
        } else {
            indicatorStyle.push(styles['partial-similar']);
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
            className={styles['table-header']}
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
                className={styles['table-cell']}
                key={`${rowKey}-${key}`}
            >
                <NumberInput
                    placeholder={this.props.afStrings('numberPlaceholder')}
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
            <table className={styles['number-matrix-overview']}>
                <tbody>
                    <tr>
                        <td className={styles['table-header']} />
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
        );
    }
}
