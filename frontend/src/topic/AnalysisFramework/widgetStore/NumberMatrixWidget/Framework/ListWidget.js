import CSSModules from 'react-css-modules';
import React from 'react';

import { afStrings } from '../../../../../common/constants';

import styles from './styles.scss';

@CSSModules(styles)
export default class NumberMatrixList extends React.PureComponent {
    render() {
        return (
            <div styleName="number-matrix-container">
                {afStrings.numberMatrixWidgetLabel}
            </div>
        );
    }
}
