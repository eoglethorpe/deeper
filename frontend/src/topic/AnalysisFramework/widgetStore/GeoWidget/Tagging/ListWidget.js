import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    TextInput,
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
export default class GeoTaggingList extends React.PureComponent {
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
            attribute = {},
        } = this.props;

        return (
            <div styleName="geo-list">
                <TextInput
                    onChange={this.handleChange}
                    value={attribute.value}
                    showHintAndError={false}
                    showLabel={false}
                />
            </div>
        );
    }
}
