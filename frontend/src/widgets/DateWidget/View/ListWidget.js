import PropTypes from 'prop-types';
import React from 'react';

import FormattedDate from '../../../vendor/react-store/components/View/FormattedDate';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError(WidgetError)
export default class DateViewList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { attribute } = this.props;

        return (
            <div className={styles.list}>
                <FormattedDate
                    date={attribute && attribute.value}
                    mode="dd-MM-yyyy"
                />
            </div>
        );
    }
}
