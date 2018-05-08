import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '../../../../../vendor/react-store/components/Action/Button/AccentButton';
import WarningButton from '../../../../../vendor/react-store/components/Action/Button/WarningButton';

import _ts from '../../../../../ts';
import { iconNames } from '../../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    identiferName: PropTypes.string.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

export default class ApplyAll extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            disabled,
            children,
            identiferName,
            onApplyAllClick,
            onApplyAllBelowClick,
        } = this.props;

        return (
            <div className={`${styles.applyInput} ${className}`}>
                { children }
                <div className={styles.applyButtons}>
                    <AccentButton
                        className={styles.applyButton}
                        transparent
                        title={_ts('addLeads', 'applyAllButtonTitle')}
                        disabled={disabled}
                        onClick={() => onApplyAllClick(identiferName)}
                        tabIndex="-1"
                    >
                        <span className={iconNames.applyAll} />
                    </AccentButton>
                    <WarningButton
                        className={styles.applyButton}
                        transparent
                        title={_ts('addLeads', 'applyAllBelowButtonTitle')}
                        disabled={disabled}
                        onClick={() => onApplyAllBelowClick(identiferName)}
                        tabIndex="-1"
                    >
                        <span className={iconNames.applyAllBelow} />
                    </WarningButton>
                </div>
            </div>
        );
    }
}

export { default as ExtractThis } from './ExtractThis';
