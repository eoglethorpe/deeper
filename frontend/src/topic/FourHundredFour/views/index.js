import CSSModules from 'react-css-modules';
import React from 'react';
import { Link } from 'react-router-dom';
import { pathNames } from '../../../common/constants';

import styles from './styles.scss';
import logo from '../../../img/deep-logo-white.png';

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
                <div styleName="error-404">ERROR 404</div>
                <img
                    styleName="icon"
                    src={logo}
                    alt="DEEP"
                    draggable="false"
                />
                <div styleName="error-msg">
                    Oops! You have come too DEEP.
                    This is where the DEEP Kraken rests.
                </div>
                <Link
                    title="Go back to DEEP"
                    to={pathNames.homeScreen}
                    styleName="link"
                >
                Go back to DEEP
                </Link>
            </div>
        );
    }
}
