import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    ListView,
} from '../../../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class GeoViewList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    mapRegionsList = (key, data) => (
        <div
            className={styles['regions-content']}
            key={key}
        >
            <span className={styles['region-name']}>{data.title}</span>
        </div>
    )

    render() {
        const {
            attribute: {
                values = [],
            } = {},
        } = this.props;

        return (
            <div styleName="geo-list">
                <ListView
                    data={values}
                    className={styles['region-list']}
                    keyExtractor={GeoViewList.valueKeyExtractor}
                    modifier={this.mapRegionsList}
                />
            </div>
        );
    }
}
