import CSSModules from 'react-css-modules';
import React from 'react';

import {
    DateInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

@CSSModules(styles)
export default class DateViewList extends React.PureComponent {
    render() {
        return (
            <div
                styleName="date-list"
            >
                <DateInput
                    styleName="date-input"
                />
            </div>
        );
    }
}
