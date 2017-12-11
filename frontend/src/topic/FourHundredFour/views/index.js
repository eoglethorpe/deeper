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
                <div styleName="error-404">Error - 404</div>
                <div styleName="error-msg">Oops!! You have come too DEEP..</div>
                <Link
                    title="Go back to DEEP"
                    to={pathNames.homeScreen}
                    styleName="link"
                >
                Click here to go back to DEEP
                </Link>
                <img
                    styleName="icon"
                    src={logo}
                    alt="DEEP"
                    draggable="false"
                />
            </div>
        );
    }
}
