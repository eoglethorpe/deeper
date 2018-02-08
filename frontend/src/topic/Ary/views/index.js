import CSSModules from 'react-css-modules';
import React from 'react';

import { pageTitles } from '../../../common/constants';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
    render() {
        return (
            <div>
                { pageTitles.ary }
            </div>
        );
    }
}
