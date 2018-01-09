import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DateInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';
import { updateAttribute } from './utils';

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
        const attribute = {
            value,
        };

        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
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
