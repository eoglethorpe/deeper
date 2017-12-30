import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

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

        if (!this.props.onDrop) {
            return;
        }

        const data = e.dataTransfer.getData('text');
        try {
            const parsedData = JSON.parse(data);
            this.props.onDrop(parsedData);
        } catch (ex) {
            const formmatedData = {
                type: 'text',
                data,
            };
            this.props.onDrop(formmatedData);
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
