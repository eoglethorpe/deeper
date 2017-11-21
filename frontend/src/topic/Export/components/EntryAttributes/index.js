import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

import {
    SelectInput,
} from '../../../../public/components/Input';


@CSSModules(styles, { allowMultiple: true })
export default class EntryAttributes extends React.PureComponent {
    render() {
        return (
            <div styleName="entry-attributes">
                <h4>Entry Attributes</h4>
                <SelectInput
                    placeholder="Pillars"
                    styleName="pillars"
                    label="Pillars"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Sub-Pillars"
                    styleName="sub-pillars"
                    label="Sub-Pillars"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Sectors and Subsectors"
                    styleName="sector-and-subsectors"
                    label="Sectors and Sub-sectors"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="From"
                    styleName="severity-from"
                    label="Severity"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="To"
                    styleName="severity-to"
                    label="Severity"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Location"
                    styleName="location"
                    label="Location"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Affected Groups"
                    styleName="affected-groups"
                    label="Affected Groups"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Demographic Groups"
                    styleName="demographic-groups"
                    label="Demographic Groups"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="From"
                    styleName="reliability-from"
                    label="Reliability"
                    showLabel
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="To"
                    styleName="reliability-to"
                    label="Reliability"
                    showLabel
                    showHintAndError={false}
                />
            </div>
        );
    }
}
