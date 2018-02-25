import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../../../vendor/react-store/components/View/List/ListView';
import BoundError from '../../../components/BoundError';

import styles from './styles.scss';

const emptyList = [];
const emptyObject = {};

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    attribute: undefined,
};

const valueKeyExtractor = d => d.key;

@BoundError
export default class MultiselectList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderSelectedOption = (key, data) => {
        const marker = '●';

        return (
            <div
                className={styles['selected-option']}
                key={key}
            >
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    {data.label}
                </div>
            </div>
        );
    }

    render() {
        const {
            attribute: {
                value = emptyList,
            } = emptyObject,
            data: {
                options = emptyList,
            } = emptyObject,
        } = this.props;

        const selectedData = options.filter(d => value.includes(d.key));
        return (
            <ListView
                data={selectedData}
                className={styles.list}
                keyExtractor={valueKeyExtractor}
                modifier={this.renderSelectedOption}
            />
        );
    }
}
