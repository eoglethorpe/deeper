/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    SelectInput,
    TextInput,
} from '../../../../public/components/Input';

import {
    setAddLeadViewFiltersAction,
    addLeadViewFiltersSelector,
} from '../../../../common/redux';

import styles from './styles.scss';


const leadTypeOptions = [
    { key: 'dropbox', label: 'Dropbox' },
    { key: 'file', label: 'Local Disk' },
    { key: 'drive', label: 'Google Drive' },
    { key: 'text', label: 'Text' },
    { key: 'website', label: 'Website' },
];

const leadStatusFilterOptions = [
    { key: 'invalid', label: 'Invalid' },
    { key: 'saved', label: 'Saved' },
    { key: 'unsaved', label: 'Unsaved' },
];

const defaultProps = {
};

const propTypes = {
    filters: PropTypes.object.isRequired, // eslint-disable-line
    setLeadViewFilters: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    filters: addLeadViewFiltersSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadViewFilters: filters => dispatch(setAddLeadViewFiltersAction(filters)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleSearchChange = (value) => {
        this.props.setLeadViewFilters({ search: value });
    }

    handleLeadTypeFilterChange = (value) => {
        this.props.setLeadViewFilters({ type: value });
    }

    handleLeadSourceFilterChange = (value) => {
        this.props.setLeadViewFilters({ source: value });
    }

    handleLeadStatusFilterChange = (value) => {
        this.props.setLeadViewFilters({ status: value });
    }

    render() {
        const {
            filters,
        } = this.props;

        return (
            <div styleName="header">
                <h2 styleName="title">
                    Leads
                </h2>
                <TextInput
                    styleName="search"
                    onChange={this.handleSearchChange}
                    value={filters.search}
                    placeholder="Search leads"
                    type="search"
                />
                <SelectInput
                    options={leadTypeOptions}
                    placeholder="Lead Type"
                    styleName="filter"
                    multiple
                    value={filters.type}
                    optionsIdentifier="lead-list-filter-options"
                    onChange={this.handleLeadTypeFilterChange}
                />
                <TextInput
                    placeholder="Source"
                    styleName="filter source-filter"
                    value={filters.source}
                    onChange={this.handleLeadSourceFilterChange}
                />
                <SelectInput
                    options={leadStatusFilterOptions}
                    placeholder="Status"
                    styleName="filter"
                    value={filters.status}
                    optionsIdentifier="lead-list-filter-options"
                    onChange={this.handleLeadStatusFilterChange}
                />
            </div>
        );
    }
}
