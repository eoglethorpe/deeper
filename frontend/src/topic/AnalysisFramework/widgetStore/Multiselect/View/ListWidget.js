import CSSModules from 'react-css-modules';
import React from 'react';

import {
    SelectInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

@CSSModules(styles)
export default class MultiselectList extends React.PureComponent {
    render() {
        return (
            <div
                styleName="multiselect-list"
            >
                <SelectInput
                    styleName="multiselect"
                />
            </div>
        );
    }
}
