import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from '../styles.scss';

const propTypes = {
    children: PropTypes.node,
    active: PropTypes.bool,
    onClick: PropTypes.func,
    onDrop: PropTypes.func,
};

const defaultProps = {
    children: undefined,
    active: false,
    onClick: undefined,
    onDrop: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class MatrixCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getStyleName = () => {
        const styleNames = [];
        styleNames.push('matrix-cell');

        const {
            active,
        } = this.props;

        if (active) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.preventDefault();
        if (this.props.onDrop) {
            const data = e.dataTransfer.getData('text');
            this.props.onDrop(data);
        }
    }

    render() {
        const {
            onDrop, // eslint-disable-line no-unused-vars
            children,
            onClick,
        } = this.props;

        const styleName = this.getStyleName();

        return (
            <button
                styleName={styleName}
                className={styleName}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
                onClick={onClick}
            >
                { children }
            </button>
        );
    }
}
