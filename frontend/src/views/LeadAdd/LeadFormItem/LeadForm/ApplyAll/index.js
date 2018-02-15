import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import AccentButton from '../../../../../vendor/react-store/components/Action/Button/AccentButton';
import WarningButton from '../../../../../vendor/react-store/components/Action/Button/WarningButton';

import { leadsStringsSelector } from '../../../../../redux';
import { iconNames } from '../../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    identiferName: PropTypes.string.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,
    leadsStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

const mapStateToProps = state => ({
    leadsStrings: leadsStringsSelector(state),
});

@connect(mapStateToProps)
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
            <div
                styleName="apply-input"
                className={className}
            >
                { children }
                <div styleName="apply-buttons">
                    <AccentButton
                        styleName="apply-button"
                        transparent
                        type="button"
                        title={this.props.leadsStrings('applyAllButtonTitle')}
                        disabled={disabled}
                        onClick={() => onApplyAllClick(identiferName)}
                        tabIndex="-1"
                    >
                        <span className={iconNames.applyAll} />
                    </AccentButton>
                    <WarningButton
                        styleName="apply-button"
                        transparent
                        type="button"
                        title={this.props.leadsStrings('applyAllBelowButtonTitle')}
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
