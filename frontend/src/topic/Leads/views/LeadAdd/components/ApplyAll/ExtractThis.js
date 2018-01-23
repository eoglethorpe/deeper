import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    AccentButton,
    // WarningButton,
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
    onClick: PropTypes.func.isRequired,
};
const defaultProps = {
    className: undefined,
};

@CSSModules(styles, { allowMultiple: true })
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
            <div styleName="apply-input" className={className}>
                { children }
                <div styleName="apply-buttons">
                    <AccentButton
                        styleName="apply-button"
                        transparent
                        type="button"
                        title={leadsString.extractLead} // TODO: use strings
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
