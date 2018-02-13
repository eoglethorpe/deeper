import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import FormattedDate from '../../../../../vendor/react-store/components/View/FormattedDate';
import BoundError from '../../../../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError
@CSSModules(styles)
export default class DateViewList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            attribute,
        } = this.props;

        return (
            <div styleName="date-list">
                <FormattedDate
                    date={attribute && attribute.value}
                    mode="dd-MM-yyyy"
                />
            </div>
        );
    }
}
