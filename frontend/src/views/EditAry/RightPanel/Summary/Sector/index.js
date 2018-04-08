import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class Sector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'sector',
            styles.sector,
        ];

        return classNames.join(' ');
    }

    render() {
        const { sectorId } = this.props;
        const className = this.getClassName();

        return (
            <div className={className}>
                {`Sector #${sectorId}`}
            </div>
        );
    }
}
