import React from 'react';
import PropTypes from 'prop-types';

import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    title: '',
    className: '',
};

export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.header,
        ];

        return classNames.join(' ');
    }

    render() {
        const { title } = this.props;
        const className = this.getClassName();

        return (
            <header className={className}>
                <h3 className={styles.heading}>
                    { title }
                </h3>
                <NonFieldErrors
                    className={styles.nonFieldErrors}
                    faramElement
                />
            </header>
        );
    }
}
