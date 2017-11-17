import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import BasicInformation from '../BasicInformation';
import EntryAttributes from '../EntryAttributes';
import LeadInformation from '../LeadInformation';
import LeadsTable from '../LeadsTable';


@CSSModules(styles, { allowMultiple: true })
export default class FilterSection extends React.PureComponent {
    render() {
        return (
            <div styleName="filters">
                <h2>Filters</h2>
                <div styleName="basic-information">
                    <BasicInformation />
                </div>
                <div styleName="entry-attributes">
                    <EntryAttributes />
                </div>
                <div styleName="lead-information">
                    <LeadInformation />
                </div>
                <div>
                    <LeadsTable />
                </div>
            </div>
        );
    }
}
