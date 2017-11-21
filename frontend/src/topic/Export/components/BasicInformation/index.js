import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

import {
    SelectInput,
    TextInput,
} from '../../../../public/components/Input';

@CSSModules(styles, { allowMultiple: true })
export default class BasicInformation extends React.PureComponent {
    render() {
        return (
            <div styleName="basic-information">
                <h4>Basic Information</h4>
                <TextInput
                    placeholder="eg: The conflict in Syria..."
                    styleName="search-excerpt"
                    label="Search Excerpt"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="eg: John Doe"
                    styleName="imported-by"
                    label="Imported By"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder=""
                    label="Date Imported"
                    styleName="date-imported"
                    showLabel
                    showHintAndError={false}
                />
            </div>
        );
    }
}
