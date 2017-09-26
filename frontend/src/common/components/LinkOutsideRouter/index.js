import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import browserHistory from '../../browserHistory';
import styles from './styles.scss';

const propTypes = {
    to: PropTypes.string.isRequired,
    className: PropTypes.string,

    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};

const defaultProps = {
    className: '',
    iconName: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class LinkOutsideRouter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    onClick = (e) => {
        // Blocks href default action
        e.preventDefault();

        // Pushes the new link to browserHistory hence the navigation
        browserHistory.push(this.props.to);

        document.body.click();
    }

    render() {
        return (
            <a
                href={this.props.to}
                onClick={this.onClick}
                className={this.props.className}
            >
                {this.props.children}
            </a>
        );
    }
}
