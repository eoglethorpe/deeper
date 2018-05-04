import PropTypes from 'prop-types';
import React from 'react';

import NumberInput from '../../../vendor/react-store/components/Input/NumberInput';
import BoundError from '../../../vendor/react-store/components/General/BoundError';

import WidgetError from '../../../components/WidgetError';
import _ts from '../../../ts';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError(WidgetError)
export default class NumberTaggingList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleChange = (value) => {
        const { api, id, entryId } = this.props;
        api.getEntryModifier(entryId)
            .setAttribute(id, { value })
            .apply();
    }

    render() {
        const { attribute = {} } = this.props;
        const { value } = attribute;
        const inputPlaceholder = _ts('af', 'numberPlaceholder');
        const separatorText = ' ';

        return (
            <div className={styles.list}>
                <NumberInput
                    onChange={this.handleChange}
                    className={styles.input}
                    value={value}
                    placeholder={inputPlaceholder}
                    showLabel={false}
                    showHintAndError={false}
                    separator={separatorText}
                />
            </div>
        );
    }
}
