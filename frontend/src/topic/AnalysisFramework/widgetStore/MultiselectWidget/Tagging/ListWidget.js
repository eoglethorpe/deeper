import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    SelectInput,
} from '../../../../../public/components/Input';

const propTypes = {
    id: PropTypes.number.isRequired,
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
        const { api, id } = this.props;
        api.setEntryAttribute(id, {
            value,
        });
    }

    render() {
        const {
            attribute,
            data,
        } = this.props;

        return (
            <div styleName="multiselect-list">
                <SelectInput
                    onChange={this.handleChange}
                    options={data}
                    multiple
                    styleName="multiselect"
                    value={attribute && attribute.value}
                    keyExtractor={Multiselect.valueKeyExtractor}
                />
            </div>
        );
    }
}
