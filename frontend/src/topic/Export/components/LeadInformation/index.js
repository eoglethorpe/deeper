import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

import {
    SelectInput,
    TextInput,
} from '../../../../public/components/Input';

import {
    TransparentButton,
} from '../../../../public/components/Action';

@CSSModules(styles, { allowMultiple: true })
export default class FilterSection extends React.PureComponent {
    render() {
        return (
            <div styleName="lead-information">
                <h4>Leads Information</h4>
                <TextInput
                    placeholder=""
                    label="Lead Title"
                    styleName="lead-title"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder=""
                    label="Source"
                    styleName="source"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder=""
                    label="Date Published"
                    styleName="date-published"
                    showLabel
                    showHintAndError={false}
                />
                <TransparentButton
                    styleName="apply-btn"
                >
                    Apply
                </TransparentButton>
                <TransparentButton
                    styleName="clear-btn"
                >
                    Clear
                </TransparentButton>
            </div>
        );
    }
}
