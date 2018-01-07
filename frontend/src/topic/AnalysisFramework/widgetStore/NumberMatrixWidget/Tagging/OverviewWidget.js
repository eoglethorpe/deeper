import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import update from '../../../../../public/utils/immutable-update';

import {
    TextInput,
    NumberInput,
} from '../../../../../public/components/Input';
import {
    TransparentDangerButton,
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    ListView,
    List,
} from '../../../../../public/components/View';

import { iconNames } from '../../../../../common/constants';
import { randomString } from '../../../../../public/utils/common';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    data: PropTypes.object, //eslint-disable-line
    api: PropTypes.object.isRequired, // eslint-disable-line
    attribute: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    data: {},
    attribute: undefined,
};

const emptyObject = {};
const emptyList = [];

@CSSModules(styles)
export default class NumberMatrixOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const { id, entryId } = props;
        console.log();
    }

    renderRow = (key, rowData) => {
        const { data } = this.props;

        return (
            <tr key={key}>
                <th scope="row">{rowData.title}</th>
                <List
                    data={data.columnHeaders || emptyList}
                    modifier={(colKey, colData) => this.renderColElement(colKey, colData, key)}
                    keyExtractor={NumberMatrixOverview.rowKeyExtractor}
                />
            </tr>
        );
    }

    renderColHeader = (key, data) => (
        <th scope="col" key={key}>{data.title}</th>
    )

    renderColElement = (key, data, rowKey) => (
        <td key={`${rowKey}-${key}`}>
            <NumberInput
                placeholder="999 999"
                showLabel={false}
                showHintAndError={false}
                separator=" "
            />
        </td>
    )

    render() {
        const { data } = this.props;
        return (
            <div styleName="number-matrix-tagging">
                <table>
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
                </table>
            </div>
        );
    }
}
