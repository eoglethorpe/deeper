import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';
import {
    ListView,
} from '../../../../../public/components/View';


const emptyList = [];

const propTypes = {
    attribute: PropTypes.object,      // eslint-disable-line
    data: PropTypes.array,      // eslint-disable-line
};

const defaultProps = {
    data: [],
    attribute: undefined,
};
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
            } = {},
            data = emptyList,
        } = this.props;
        const selectedData = data.filter(d => value.includes(d.key));
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
