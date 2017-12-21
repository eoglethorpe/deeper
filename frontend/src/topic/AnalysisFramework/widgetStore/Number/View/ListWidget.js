import CSSModules from 'react-css-modules';
import React from 'react';

import {
    DateInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

@CSSModules(styles)
export default class DateInformationList extends React.PureComponent {
    render() {
        return (
            <div
                styleName="date-list"
            >
                <DateInput />
            </div>
        );
    }
}
