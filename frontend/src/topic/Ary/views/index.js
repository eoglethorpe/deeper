import CSSModules from 'react-css-modules';
import React from 'react';

import { pageTitles } from '../../../common/constants';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div>
                { pageTitles.ary }
            </div>
        );
    }
}
