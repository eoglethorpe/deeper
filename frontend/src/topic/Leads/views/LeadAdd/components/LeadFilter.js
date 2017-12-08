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
} from '../../../../../public/components/Input';
import { DangerButton } from '../../../../../public/components/Action';
import { isObjectEmpty } from '../../../../../public/utils/common';
import { FgRestBuilder } from '../../../../../public/utils/rest';

import {
    tokenSelector,
    activeProjectSelector,
    addLeadViewSetFiltersAction,
    addLeadViewUnsetFiltersAction,
    addLeadViewFiltersSelector,
    setLeadFilterOptionsAction,
} from '../../../../../common/redux';
import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../../../../common/rest';

import { LEAD_TYPE, LEAD_FILTER_STATUS } from '../utils/constants';
import styles from '../styles.scss';


const leadTypeOptions = [
    { key: LEAD_TYPE.dropbox, label: 'Dropbox' },
    { key: LEAD_TYPE.file, label: 'Local Disk' },
    { key: LEAD_TYPE.drive, label: 'Google Drive' },
    { key: LEAD_TYPE.text, label: 'Text' },
    { key: LEAD_TYPE.website, label: 'Website' },
];

const leadStatusFilterOptions = [
    { key: LEAD_FILTER_STATUS.invalid, label: 'Invalid' },
    { key: LEAD_FILTER_STATUS.saved, label: 'Saved' },
    { key: LEAD_FILTER_STATUS.unsaved, label: 'Unsaved' },
];

const defaultProps = { }; const propTypes = {
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,

    filters: PropTypes.object.isRequired, // eslint-disable-line
    activeProject: PropTypes.number.isRequired,
    setLeadViewFilters: PropTypes.func.isRequired,
    unsetLeadViewFilters: PropTypes.func.isRequired,
    setLeadFilterOptions: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
    activeProject: activeProjectSelector(state),
    filters: addLeadViewFiltersSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadViewFilters: filters => dispatch(addLeadViewSetFiltersAction(filters)),
    unsetLeadViewFilters: () => dispatch(addLeadViewUnsetFiltersAction()),
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeadFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        const { activeProject } = this.props;
        this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(
            activeProject,
        );
        this.leadFilterOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject } = nextProps;
        if (this.props.activeProject !== activeProject) {
            if (this.leadFilterOptionsRequest) {
                this.leadFilterOptionsRequest.stop();
            }

            this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(
                activeProject,
            );
            this.leadFilterOptionsRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }
    }

    createRequestForProjectLeadFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForLeadFilterOptions(activeProject);
        const paramsForProjectFilterOptions = () => {
            const { token } = this.props;
            const { access } = token;
            return createParamsForUser({ access });
        };

        const leadFilterOptionsRequest = new FgRestBuilder()
            .url(urlForProjectFilterOptions)
            .params(paramsForProjectFilterOptions)
            .success((response) => {
                this.props.setLeadFilterOptions({
                    projectId: activeProject,
                    leadFilterOptions: response,
                });
            })
            .build();

        return leadFilterOptionsRequest;
    }


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

    handleClearFilters = () => {
        this.props.unsetLeadViewFilters();
    }

    render() {
        const {
            filters,
        } = this.props;

        const isFilterEmpty = isObjectEmpty(filters);

        return (
            <div
                styleName="lead-filters"
            >
                <TextInput
                    label="Search"
                    onChange={this.handleSearchChange}
                    value={filters.search}
                    placeholder="Search"
                    type="search"
                    showHintAndError={false}
                />
                <TextInput
                    label="Source"
                    placeholder="Any"
                    value={filters.source}
                    onChange={this.handleLeadSourceFilterChange}
                    showHintAndError={false}
                />
                <SelectInput
                    label="Status"
                    showLabel
                    options={leadStatusFilterOptions}
                    placeholder="All"
                    value={filters.status}
                    optionsIdentifier="lead-list-filter-options"
                    onChange={this.handleLeadStatusFilterChange}
                    showHintAndError={false}
                />
                <SelectInput
                    label="Lead Type"
                    showLabel
                    options={leadTypeOptions}
                    placeholder="All"
                    multiple
                    value={filters.type}
                    optionsIdentifier="lead-list-filter-options"
                    onChange={this.handleLeadTypeFilterChange}
                    showHintAndError={false}
                />
                <DangerButton
                    type="button"
                    disabled={isFilterEmpty}
                    onClick={this.handleClearFilters}
                >
                    Clear Filter
                </DangerButton>
            </div>
        );
    }
}
