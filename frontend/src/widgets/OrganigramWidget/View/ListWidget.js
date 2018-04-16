import React from 'react';
import PropTypes from 'prop-types';

import WidgetEmptyComponent from '../../../components/WidgetEmptyComponent';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError(WidgetError)
export default class OrganigramList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderSelectedOrgan = (key, data) => {
        const {
            id,
            name,
        } = data;
        const marker = '•';

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
