import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    DateInput,
} from '../../../../../public/components/Input';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class DateTaggingList extends React.PureComponent {
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
                />
            </div>
        );
    }
}
