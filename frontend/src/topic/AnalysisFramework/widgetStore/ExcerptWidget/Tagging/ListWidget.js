import CSSModules from 'react-css-modules';
import React from 'react';
import styles from './styles.scss';

import {
    TextArea,
} from '../../../../../public/components/Input';

@CSSModules(styles)
export default class ExcerptList extends React.PureComponent {
    render() {
        return (
            <div styleName="excerpt-list">
                <TextArea
                    styleName="textarea"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
