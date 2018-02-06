import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../../../../../public/components/View/List/ListView';
import BoundError from '../../../../../common/components/BoundError';

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

@BoundError
@CSSModules(styles)
export default class MultiselectList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    mapMultiselectList = (key, data) => (
        <div
            className={styles['multiselect-content']}
            key={key}
        >
            <span className={styles['multiselect-name']}>{data.label}</span>
        </div>
    )

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
            <div
                styleName="multiselect-list"
            >
                <ListView
                    data={selectedData}
                    className={styles['multiselect-list-view']}
                    keyExtractor={MultiselectList.valueKeyExtractor}
                    modifier={this.mapMultiselectList}
                />
            </div>
        );
    }
}
