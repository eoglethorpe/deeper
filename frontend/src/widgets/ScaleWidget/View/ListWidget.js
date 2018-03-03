import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../../../vendor/react-store/components/View/List/ListView';
import BoundError from '../../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
    data: undefined,
};

const emptyObject = {};
const emptyList = [];

@BoundError
export default class ScaleViewWidget extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getActiveSelectionClassName = (key) => {
        const { attribute = emptyObject } = this.props;
        const { selectedScale } = attribute;

        const classNames = [
            styles['scale-unit'],
        ];

        if (selectedScale === key) {
            classNames.push(styles.selected);
        }

        return classNames.join(' ');
    }

    getScale = (key, data) => (
        <button
            key={key}
            title={data.title}
            className={this.getActiveSelectionClassName(key)}
            style={{ backgroundColor: data.color }}
        />
    )

    render() {
        const { data = emptyObject } = this.props;

        return (
            <ListView
                className={styles.list}
                data={data.scaleUnits || emptyList}
                keyExtractor={ScaleViewWidget.rowKeyExtractor}
                modifier={this.getScale}
            />
        );
    }
}
