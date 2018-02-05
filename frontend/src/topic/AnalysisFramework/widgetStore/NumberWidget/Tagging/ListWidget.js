import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { NumberInput } from '../../../../../public/components/Input';
import { afStringsSelector } from '../../../../../common/redux';

import styles from './styles.scss';
import { updateAttribute } from './utils';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    attribute: undefined,
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles)
export default class NumberTaggingList extends React.PureComponent {
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
                    onChange={this.handleChange}
                    styleName="number-input"
                    value={value}
                    placeholder={this.props.afStrings('numberPlaceholder')}
                    showLabel={false}
                    showHintAndError={false}
                    separator=" "
                />
            </div>
        );
    }
}
