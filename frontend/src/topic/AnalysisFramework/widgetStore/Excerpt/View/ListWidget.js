import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';

@CSSModules(styles)
export default class ExcerptTextList extends React.PureComponent {
    render() {
        return (
            <div
                styleName="excerpt-list"
            >
                Text or image excerpt
            </div>
        );
    }
}
