import CSSModules from 'react-css-modules';
import React from 'react';

import {
    TextInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

@CSSModules(styles)
export default class NumberList extends React.PureComponent {
    render() {
        return (
            <div
                styleName="number-list"
            >
                <TextInput
                    placeholder="eg: 147181"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
