import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import React from 'react';

import styles from './styles.scss';
import { pageTitles } from '../../../common/constants';

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
            <div>
                <Helmet>
                    <title>{ pageTitles.fourHundredFour }</title>
                </Helmet>
                { pageTitles.fourHundredFour }
            </div>
        );
    }
}
