import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    DateInput,
} from '../../../../../public/components/Input';
import {
    FormattedDate,
} from '../../../../../public/components/View';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line
    exportable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

const ONE_DAY = 24 * 60 * 60 * 1000;

@CSSModules(styles)
export default class DateTaggingList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    createFilterData = attribute => ({
        values: undefined,
        number: attribute.value && (
            Math.round(new Date(attribute.value).getTime() / ONE_DAY)
        ),
    })

    createExportData = attribute => ({
        excel: {
            value: attribute.value && (FormattedDate.format(
                new Date(attribute.value),
                'dd-MM-yyyy',
            )),
        },
    })

    handleChange = (value) => {
        const { api, id, entryId, filters, exportable } = this.props;
        const attribute = {
            value,
        };

        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .setFilterData(filters[0].id, this.createFilterData(attribute))
            .setExportData(exportable.id, this.createExportData(attribute))
            .apply();
    }

    render() {
        const {
            attribute,
        } = this.props;

        return (
            <div styleName="date-list">
                <DateInput
                    styleName="date-input"
                    onChange={this.handleChange}
                    value={attribute && attribute.value}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
