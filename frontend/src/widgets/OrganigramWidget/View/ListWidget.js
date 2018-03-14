import React from 'react';
import PropTypes from 'prop-types';

import WidgetEmptyComponent from '../../../components/WidgetEmptyComponent';
import BoundError from '../../../components/BoundError';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError
export default class OrganigramList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderSelectedOrgan = (key, data) => {
        const {
            id,
            name,
        } = data;
        const marker = '●';

        return (
            <div
                className={styles.organ}
                key={id}
            >
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    { name }
                </div>
            </div>
        );
    }

    render() {
        console.warn(this.props.attribute);
        const { attribute: { values = [] } = {} } = this.props;

        return (
            <ListView
                className={styles.list}
                data={values}
                modifier={this.renderSelectedOrgan}
                emptyComponent={WidgetEmptyComponent}
            />
        );
    }
}
