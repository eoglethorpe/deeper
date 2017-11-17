import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

import {
    TextInput,
    SelectInput,
} from '../../../../public/components/Input';

@CSSModules(styles, { allowMultiple: true })
export default class FilterSection extends React.PureComponent {
    render() {
        return (
            <div styleName="lead-information">
                <h4>Lead Information</h4>
                <TextInput
                    placeholder="Lead Title"
                    styleName="lead-title"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Source"
                    styleName="source"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Date Published"
                    styleName="date-published"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
