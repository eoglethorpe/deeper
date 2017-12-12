import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';
import BasicInformation from '../BasicInformation';
import EntryAttributes from '../EntryAttributes';
import LeadInformation from '../LeadInformation';
import LeadsTable from '../LeadsTable';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class FilterSection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    render() {
        return (
            <div
                className={this.props.className}
                styleName="filters"
            >
                <div styleName="basic-information">
                    <BasicInformation />
                </div>
                <div styleName="entry-attributes">
                    <EntryAttributes />
                </div>
                <div styleName="lead-information">
                    <LeadInformation />
                </div>
                <LeadsTable
                    styleName="leads-table"
                />
            </div>
        );
    }
}
