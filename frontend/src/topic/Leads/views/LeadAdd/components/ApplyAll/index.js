import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    TransparentAccentButton,
    TransparentWarningButton,
} from '../../../../../../public/components/Action';

import {
    iconNames,
    leadsString,
} from '../../../../../../common/constants';

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

@CSSModules(styles, { allowMultiple: true })
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
            <div styleName="apply-input" className={className}>
                { children }
                <div styleName="apply-buttons">
                    <TransparentAccentButton
                        styleName="apply-button"
                        type="button"
                        title={leadsString.applyAllButtonTitle}
                        disabled={disabled}
                        onClick={() => onApplyAllClick(identiferName)}
                        tabIndex="-1"
                    >
                        <span className={iconNames.applyAll} />
                    </TransparentAccentButton>
                    <TransparentWarningButton
                        styleName="apply-button"
                        type="button"
                        title={leadsString.applyAllBelowButtonTitle}
                        disabled={disabled}
                        onClick={() => onApplyAllBelowClick(identiferName)}
                        tabIndex="-1"
                    >
                        <span className={iconNames.applyAllBelow} />
                    </TransparentWarningButton>
                </div>
            </div>
        );
    }
}
