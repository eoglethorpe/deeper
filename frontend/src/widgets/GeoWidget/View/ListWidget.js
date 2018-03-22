import PropTypes from 'prop-types';
import React from 'react';

import WidgetEmptyComponent from '../../../components/WidgetEmptyComponent';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import BoundError from '../../../components/BoundError';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError
export default class GeoViewList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    mapRegionsList = (key, data) => (
        <span
            key={key}
            className={styles.regionName}
        >
            {data.label}
        </span>
    )

    render() {
        const {
            attribute: {
                values = [],
            } = {},
        } = this.props;

        return (
            <ListView
                data={values}
                className={styles.list}
                keyExtractor={GeoViewList.valueKeyExtractor}
                modifier={this.mapRegionsList}
                emptyComponent={WidgetEmptyComponent}
            />
        );
    }
}
