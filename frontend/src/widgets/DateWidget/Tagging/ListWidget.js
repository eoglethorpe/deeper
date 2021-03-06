import PropTypes from 'prop-types';
import React from 'react';

import DateInput from '../../../vendor/react-store/components/Input/DateInput';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
    data: undefined,
};

@BoundError(WidgetError)
export default class DateTaggingList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        const {
            data: { informationDateSelected } = {},
            attribute = {},
            api,
            id,
            entryId,
        } = this.props;


        if (informationDateSelected && !attribute.value) {
            api.getEntryModifier(entryId)
                .setAttribute(id, { value: api.getLeadDate() })
                .setDate(api.getLeadDate())
                .apply();
        }
    }

    handleChange = (value) => {
        const {
            api,
            id,
            entryId,
            data,
        } = this.props;
        const attribute = { value };

        const modifier = api.getEntryModifier(entryId)
            .setAttribute(id, attribute);

        if (data && data.informationDateSelected) {
            modifier.setDate(value);
        }
        modifier.apply();
    }

    render() {
        const { attribute } = this.props;

        return (
            <div className={styles.list}>
                <DateInput
                    className={styles.dateInput}
                    onChange={this.handleChange}
                    showHintAndError={false}
                    value={attribute && attribute.value}
                />
            </div>
        );
    }
}
