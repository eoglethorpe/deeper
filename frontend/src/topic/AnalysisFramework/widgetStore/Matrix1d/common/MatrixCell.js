import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from '../styles.scss';

const MODE_VIEW = 'view';
const MODE_TAG = 'tag';

const propTypes = {
    children: PropTypes.node,
    mode: PropTypes.string,
    active: PropTypes.bool,
    onClick: PropTypes.func,
    onDrop: PropTypes.func,
};

const defaultProps = {
    children: undefined,
    mode: MODE_VIEW,
    active: false,
    onClick: undefined,
    onDrop: undefined,
};

@CSSModules(styles)
export default class MatrixCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getStyleName = () => {
        const styleNames = [];
        styleNames.push('matrix-cell');

        const {
            mode,
            active,
        } = this.props;

        if (mode === MODE_TAG && active) {
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
            mode,
        } = this.props;

        const styleName = this.getStyleName();

        return (
            mode === MODE_TAG ? (
                <button
                    styleName={styleName}
                    className={styleName}
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}
                    onClick={onClick}
                >
                    { children }
                </button>
            ) : (
                <div
                    styleName={styleName}
                    className={styleName}
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}
                >
                    { children }
                </div>
            )
        );
    }
}
