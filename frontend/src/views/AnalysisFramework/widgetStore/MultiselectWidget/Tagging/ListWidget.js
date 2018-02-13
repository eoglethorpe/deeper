import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import MultiSelectInput from '../../../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import ListView from '../../../../../vendor/react-store/components/View/List/ListView';

import BoundError from '../../../../../components/BoundError';
import { updateAttribute } from './utils';

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
@CSSModules(styles)
export default class Multiselect extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            updateAttribute(nextProps);
        }
    }

    handleChange = (value) => {
        const { api, id, entryId } = this.props;
        const attribute = { value };

        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    mapMultiselectList = (key, data) => (
        <div
            className={styles['multiselect-content']}
            key={key}
        >
            <span className={styles['multiselect-name']}>
                {data.label}
            </span>
        </div>
    )

    render() {
        const {
            attribute: { value = emptyList } = {},
            data,
        } = this.props;

        const selectedData = (data.options || emptyList).filter(d => value.includes(d.key));

        return (
            <div styleName="multiselect-list">
                <MultiSelectInput
                    onChange={this.handleChange}
                    options={data.options}
                    hideClearButton
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
