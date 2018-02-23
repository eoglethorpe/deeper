import PropTypes from 'prop-types';
import React from 'react';

import MultiSelectInput from '../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import ListView from '../../../vendor/react-store/components/View/List/ListView';

import BoundError from '../../../components/BoundError';

import styles from './styles.scss';

const emptyList = [];

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    attribute: undefined,
};

@BoundError
export default class Multiselect extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleChange = (value) => {
        const { api, id, entryId } = this.props;
        const attribute = { value };

        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    renderSelectedOption = (key, data) => {
        const marker = '●';

        return (
            <div
                className={styles['selected-option']}
                key={key}
            >
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    {data.label}
                </div>
            </div>
        );
    }

    render() {
        const {
            attribute: { value = emptyList } = {},
            data,
        } = this.props;

        const { options = emptyList } = data;
        const selectedData = options.filter(d => value.includes(d.key));

        return (
            <div className={styles.list}>
                <MultiSelectInput
                    onChange={this.handleChange}
                    options={options}
                    hideClearButton
                    className={styles.input}
                    value={value}
                    keyExtractor={Multiselect.valueKeyExtractor}
                    showHintAndError={false}
                />
                <ListView
                    data={selectedData}
                    className={styles['selected-options']}
                    keyExtractor={Multiselect.valueKeyExtractor}
                    modifier={this.renderSelectedOption}
                />
            </div>
        );
    }
}
