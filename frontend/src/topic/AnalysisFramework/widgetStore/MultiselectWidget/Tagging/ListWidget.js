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

    handleChange = (value) => {
        const { api, id, entryId } = this.props;
        api.getEntryModifier(entryId)
            .setAttribute(id, {
                value,
            })
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
