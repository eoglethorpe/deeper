import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from '../styles.scss';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: undefined,
};

@CSSModules(styles)
export default class MatrixCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.preventDefault();
        console.log(e.dataTransfer.getData('text'));
    }

    render() {
        const {
            children,
        } = this.props;

        return (
            <div
                styleName="matrix-cell"
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
            >
                { children }
            </div>
        );
    }
}
