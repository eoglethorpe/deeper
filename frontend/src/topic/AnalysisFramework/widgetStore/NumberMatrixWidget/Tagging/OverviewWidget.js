import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import update from '../../../../../public/utils/immutable-update';

import {
    NumberInput,
} from '../../../../../public/components/Input';
import {
    List,
} from '../../../../../public/components/View';
import { afStrings } from '../../../../../common/constants';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    data: PropTypes.object, //eslint-disable-line
    api: PropTypes.object.isRequired, // eslint-disable-line
    attribute: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    data: {},
    attribute: {},
};

const emptyList = [];
const emptyObject = {};

@CSSModules(styles)
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

    renderRow = (key, rowData) => {
        const { data, attribute } = this.props;
        const values = Object.values(attribute[key] || emptyObject)
            .filter(v => v);
        const isSame = values.length === 0 || (new Set(values).size === 1);

        return (
            <tr key={key} >
                <th
                    className={isSame ? (
                        styles['table-header-row']
                    ) : (
                        `${styles['table-header-row']} ${styles['not-similar']}`
                    )}
                    scope="row"
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
                    placeholder={afStrings.numberPlaceholder}
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
            <table styleName="number-matrix-overview">
                <tbody>
                    <tr>
                        <td styleName="table-header" />
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
