import PropTypes from 'prop-types';
import React from 'react';

import {
    SelectInput,
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
            excerpt,
            createdBy,
            createdAt,
        } = values;

        return ([
            <h4
                className={styles.title}
                key="title"
            >
                Basic Information
            </h4>,
            <TextInput
                className={styles.excerpt}
                key="excerpt"
                label="Search Excerpt"
                onChange={(value) => { this.handleInputChange('excerpt', value); }}
                placeholder="Words in excerpt"
                showHintAndError={false}
                value={excerpt}
            />,
            <SelectInput
                className={styles['created-by']}
                key="created-by"
                label="Created by"
                multiple
                onChange={(value) => { this.handleInputChange('createdBy', value); }}
                showHintAndError={false}
                value={createdBy}
            />,
            <DateFilter
                className={styles['created-at']}
                key="created-at"
                label="Created at"
                onChange={(value) => { this.handleInputChange('createdAt', value); }}
                showHintAndError={false}
                value={createdAt}
            />,
        ]);
    }
}
