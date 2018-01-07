import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    SelectInput,
} from '../../../../../public/components/Input';

import {
    ListView,
} from '../../../../../public/components/View';

const emptyList = [];

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    exportable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object,      // eslint-disable-line
    data: PropTypes.array,      // eslint-disable-line
};

const defaultProps = {
    data: [],
    attribute: undefined,
};

@CSSModules(styles)
export default class Multiselect extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    createFilterData = attribute => ({
        values: attribute.value,
        number: undefined,
    })

    createExportData = (attribute) => {
        const { data } = this.props;

        return {
            excel: {
                type: 'list',
                value: attribute.value.map(key => data.find(d => d.key === key).label),
            },
        };
    }

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

    mapMultiselectList = (key, data) => (
        <div
            className={styles['multiselect-content']}
            key={key}
        >
            <span className={styles['multiselect-name']}>{data.label}</span>
        </div>
    )

    render() {
        const {
            attribute: {
                value = emptyList,
            } = {},
            data = emptyList,
        } = this.props;

        const selectedData = data.filter(d => value.includes(d.key));

        return (
            <div styleName="multiselect-list">
                <SelectInput
                    onChange={this.handleChange}
                    options={data}
                    multiple
                    clearable={false}
                    styleName="multiselect"
                    value={value}
                    keyExtractor={Multiselect.valueKeyExtractor}
                />
                <ListView
                    data={selectedData}
                    className={styles['multiselect-list-view']}
                    keyExtractor={Multiselect.valueKeyExtractor}
                    modifier={this.mapMultiselectList}
                />
            </div>
        );
    }
}
