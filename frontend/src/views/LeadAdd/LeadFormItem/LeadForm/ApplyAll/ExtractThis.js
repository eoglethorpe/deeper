import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '../../../../../vendor/react-store/components/Action/Button/AccentButton';

import _ts from '../../../../../ts';
import { iconNames } from '../../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
};
const defaultProps = {
    className: undefined,
};

export default class ExtractThis extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            disabled,
            children,
            onClick,
        } = this.props;

        return (
            <div className={`${styles.applyInput} ${className}`}>
                { children }
                <div className={styles.applyButtons}>
                    <AccentButton
                        className={styles.applyButton}
                        transparent
                        title={_ts('leads', 'extractLead')}
                        disabled={disabled}
                        onClick={onClick}
                        tabIndex="-1"
                    >
                        <span className={iconNames.eye} />
                    </AccentButton>
                </div>
            </div>
        );
    }
}
