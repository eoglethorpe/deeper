import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import React from 'react';

import { pageTitles } from '../../../common/constants';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
    leads: [],
};

@CSSModules(styles, { allowMultiple: true })
export default class WeeklySnapshot extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div>
                <Helmet>
                    <title>{ pageTitles.weeklySnapshot }</title>
                </Helmet>
                { pageTitles.weeklySnapshot }
            </div>
        );
    }
}
