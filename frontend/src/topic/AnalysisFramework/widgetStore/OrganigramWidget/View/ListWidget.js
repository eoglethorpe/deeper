import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';
import {
    ListView,
} from '../../../../../public/components/View';

const propTypes = {
    value: PropTypes.array,      // eslint-disable-line
};

const defaultProps = {
    value: [],
};
@CSSModules(styles)
export default class OrganigramList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
        const {
            value,
        } = this.props;
        return (
            <div
                styleName="organigram-list"
            >
                <ListView
                    data={value}
                    keyExtractor={OrganigramList.valueKeyExtractor}
                />
            </div>
        );
    }
}
