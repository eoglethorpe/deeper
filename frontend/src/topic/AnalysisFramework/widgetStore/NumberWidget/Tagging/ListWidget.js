import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    NumberInput,
} from '../../../../../public/components/Input';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
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
        return (
            <div styleName="number-list">
                <NumberInput
                    styleName="number-input"
                    onChange={this.handleChange}
                    value={value}
                    placeholder="999"
                    showLabel={false}
                    showHintAndError={false}
                    separator=" "
                />
            </div>
        );
    }
}
