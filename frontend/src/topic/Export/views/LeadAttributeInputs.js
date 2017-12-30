import PropTypes from 'prop-types';
import React from 'react';

import {
    TextInput,
    DateFilter,
} from '../../../public/components/Input';

import update from '../../../public/utils/immutable-update';

import styles from './styles.scss';

const propTypes = {
    values: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class BasicInformationInputs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleInputChange = (key, value) => {
        const {
            values,
            onChange,
        } = this.props;

        const settings = {
            [key]: {
                $set: value,
            },
        };

        const newValues = update(values, settings);

        onChange(newValues);
    }

    render() {
        const {
            values,
        } = this.props;

        const {
            leadTitle,
            leadSource,
            leadCreatedAt,
        } = values;

        return ([
            <h4 key="title">
                LeadAttributes
            </h4>,
            <TextInput
                className={styles.title}
                key="lead-title"
                label="Lead title"
                onChange={(value) => { this.handleInputChange('leadTitle', value); }}
                showHintAndError={false}
                value={leadTitle}
            />,
            <TextInput
                className={styles.source}
                key="source"
                label="Source"
                multiple
                onChange={(value) => { this.handleInputChange('leadSource', value); }}
                showHintAndError={false}
                value={leadSource}
            />,
            <DateFilter
                className={styles['created-at']}
                key="created-at"
                label="Created at"
                onChange={(value) => { this.handleInputChange('leadCreatedAt', value); }}
                showHintAndError={false}
                value={leadCreatedAt}
            />,
        ]);
    }
}
