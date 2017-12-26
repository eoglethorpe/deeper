import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    value: undefined,
};
@CSSModules(styles)
export default class OrganigramList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div
                styleName="organigram-list"
            >
                Oraganigram view
            </div>
        );
    }
}
