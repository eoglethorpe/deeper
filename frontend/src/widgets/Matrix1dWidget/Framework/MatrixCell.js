import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: undefined,
};

export default class MatrixCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const classNames = [
            styles['matrix-cell'],
        ];

        return classNames.join(' ');
    }

    render() {
        const { children } = this.props;
        const className = this.getClassName();

        return (
            <div className={className}>
                { children }
            </div>
        );
    }
}
