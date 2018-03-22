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

export default class MatrixCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const classNames = [];
        classNames.push(styles.matrixCell);

        const { active } = this.props;
        if (active) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.preventDefault();
        const { onDrop } = this.props;

        if (!onDrop) {
            return;
        }

        const data = e.dataTransfer.getData('text');
        try {
            const parsedData = JSON.parse(data);
            onDrop(parsedData);
        } catch (ex) {
            const formattedData = {
                type: 'excerpt',
                data,
            };
            onDrop(formattedData);
        }
    }

    render() {
        const {
            children,
            onClick,
        } = this.props;

        const className = this.getClassName();

        return (
            <button
                className={className}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
                onClick={onClick}
            >
                { children }
            </button>
        );
    }
}
