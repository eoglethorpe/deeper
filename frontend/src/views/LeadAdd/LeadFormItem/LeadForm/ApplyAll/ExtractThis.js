import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import AccentButton from '../../../../../vendor/react-store/components/Action/Button/AccentButton';

import { leadsStringsSelector } from '../../../../../redux';
import { iconNames } from '../../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
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
                        title={this.props.leadsStrings('extractLead')}
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
