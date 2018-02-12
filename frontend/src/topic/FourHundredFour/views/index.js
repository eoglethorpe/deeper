import CSSModules from 'react-css-modules';
import React from 'react';
import ReactSVG from 'react-svg';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BoundError from '../../../common/components/BoundError';
import { fourHundredFourStringsSelector } from '../../../common/redux';
import { pathNames } from '../../../common/constants';

import styles from './styles.scss';
import logo from '../../../img/deep-logo.svg';

const propTypes = {
    fourHundredFourStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    fourHundredFourStrings: fourHundredFourStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class FourHundredFour extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div styleName="four-hundred-four">
                <ReactSVG
                    styleName="deep-logo"
                    path={logo}
                />
                <h1 styleName="heading">
                    {this.props.fourHundredFourStrings('errorFourHundredFour')}
                </h1>
                <p styleName="message">
                    {this.props.fourHundredFourStrings('message1')}<br />
                    {this.props.fourHundredFourStrings('message2')}
                </p>
                <Link
                    to={pathNames.homeScreen}
                    styleName="home-screen-link"
                >
                    {this.props.fourHundredFourStrings('goToDeep')}
                </Link>
            </div>
        );
    }
}
