import CSSModules from 'react-css-modules';
import React from 'react';

import { afStrings } from '../../../../../common/constants';

import styles from './styles.scss';

@CSSModules(styles)
export default class Matrix2dList extends React.PureComponent {
    render() {
        return (
            <div styleName="matrix-two-container">
                {afStrings.matrix2DWidgetLabel}
            </div>
        );
    }
}
