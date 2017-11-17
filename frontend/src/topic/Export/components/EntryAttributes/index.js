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
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Sub-Pillars"
                    styleName="sub-pillars"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Sectors and Subsectors"
                    styleName="sector-and-subsectors"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="From"
                    styleName="severity-from"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="To"
                    styleName="severity-to"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Location"
                    styleName="location"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Affected Groups"
                    styleName="affected-groups"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="Demographic Groups"
                    styleName="demographic-groups"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="From"
                    styleName="reliability-from"
                    showLabel={false}
                    showHintAndError={false}
                />
                <SelectInput
                    placeholder="To"
                    styleName="reliability-to"
                    showLabel={false}
                    showHintAndError={false}
                />
            </div>
        );
    }
}
