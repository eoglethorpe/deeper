import PropTypes from 'prop-types';
import React from 'react';

import Numeral from '../../../vendor/react-store/components/View/Numeral';
import BoundError from '../../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError
export default class NumberViewList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { attribute = {} } = this.props;
        const { value } = attribute;

        const separatorText = ' ';
        const invalidText = '-';

        return (
            <div className={styles.list}>
                <Numeral
                    separator={separatorText}
                    invalidText={invalidText}
                    showThousandSeparator
                    precision={null}
                    value={value}
                />
            </div>
        );
    }
}
