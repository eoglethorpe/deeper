import CSSModules from 'react-css-modules';
import React from 'react';
import ReactSVG from 'react-svg';
import { Link } from 'react-router-dom';
import {
    pathNames,
    fourHundredFourStrings,
} from '../../../common/constants';

import styles from './styles.scss';
import logo from '../../../img/deep-logo.svg';

const propTypes = {
};

const defaultProps = {
};

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
                    {fourHundredFourStrings.errorFourHundredFour}
                </h1>
                <p styleName="message">
                    {fourHundredFourStrings.message1}<br />
                    {fourHundredFourStrings.message2}
                </p>
                <Link
                    to={pathNames.homeScreen}
                    styleName="home-screen-link"
                >
                    {fourHundredFourStrings.goToDeep}
                </Link>
            </div>
        );
    }
}
