import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

import {
    TextInput,
    SelectInput,
} from '../../../../public/components/Input';

@CSSModules(styles, { allowMultiple: true })
export default class BasicInformation extends React.PureComponent {
    render() {
        return (
            <div styleName="basic-information">
                <h4>Basic Information</h4>
                <TextInput
                    placeholder="Search Excerpt"
                    styleName="search-excerpt"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Imported By"
                    styleName="imported-by"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Date Imported"
                    styleName="date-imported"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
