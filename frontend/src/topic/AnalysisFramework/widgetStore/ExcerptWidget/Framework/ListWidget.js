import CSSModules from 'react-css-modules';
import React from 'react';

import { afStrings } from '../../../../../common/constants';

import styles from './styles.scss';

@CSSModules(styles)
export default class ExcerptTextList extends React.PureComponent {
    render() {
        return (
            <div styleName="excerpt-list">
                {afStrings.textOrImageExcerptWidgetLabel}
            </div>
        );
    }
}
