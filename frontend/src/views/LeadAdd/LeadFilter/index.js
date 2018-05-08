/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { BgRestBuilder } from '../../../vendor/react-store/utils/rest';
import MultiSelectInput from '../../../vendor/react-store/components/Input/MultiSelectInput';
import SelectInput from '../../../vendor/react-store/components/Input/SelectInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import SearchInput from '../../../vendor/react-store/components/Input/SearchInput';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';

import {
    activeProjectIdFromStateSelector,
    addLeadViewSetFiltersAction,
    addLeadViewUnsetFiltersAction,
    addLeadViewFiltersSelector,
    addLeadViewIsFilterEmptySelector,
    setLeadFilterOptionsAction,
} from '../../../redux';
import {
    createParamsForGet,
    createUrlForLeadFilterOptions,
} from '../../../rest';
import {
    LEAD_TYPE,
    LEAD_FILTER_STATUS,
} from '../../../entities/lead';
import _ts from '../../../ts';
import schema from '../../../schema';

import styles from './styles.scss';

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

const defaultProps = { };

const propTypes = {
    isFilterEmpty: PropTypes.bool.isRequired,
    filters: PropTypes.object.isRequired, // eslint-disable-line
    activeProject: PropTypes.number.isRequired,
    setLeadViewFilters: PropTypes.func.isRequired,
    unsetLeadViewFilters: PropTypes.func.isRequired,
    setLeadFilterOptions: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: addLeadViewFiltersSelector(state),
    isFilterEmpty: addLeadViewIsFilterEmptySelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadViewFilters: filters => dispatch(addLeadViewSetFiltersAction(filters)),
    unsetLeadViewFilters: () => dispatch(addLeadViewUnsetFiltersAction()),
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
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
        const leadFilterOptionsRequest = new BgRestBuilder()
            .url(createUrlForLeadFilterOptions(activeProject))
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'projectLeadFilterOptions');
                    this.props.setLeadFilterOptions({
                        projectId: activeProject,
                        leadFilterOptions: response,
                    });
                } catch (err) {
                    console.error(err);
                }
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
        const { filters, isFilterEmpty } = this.props;

        return (
            <div
                className={styles.leadFilters}
            >
                <SearchInput
                    label={_ts('leads', 'placeholderSearch')}
                    onChange={this.handleSearchChange}
                    value={filters.search}
                    placeholder={_ts('leads', 'placeholderSearch')}
                    showHintAndError={false}
                />
                <TextInput
                    label={_ts('leads', 'filterPublisher')}
                    placeholder={_ts('leads', 'placeholderAny')}
                    value={filters.source}
                    onChange={this.handleLeadSourceFilterChange}
                    showHintAndError={false}
                />
                <SelectInput
                    label={_ts('leads', 'filterStatus')}
                    showLabel
                    options={leadStatusFilterOptions}
                    placeholder={_ts('leads', 'placeholderAny')}
                    value={filters.status}
                    onChange={this.handleLeadStatusFilterChange}
                    showHintAndError={false}
                />
                <MultiSelectInput
                    label={_ts('leads', 'filterSourceType')}
                    showLabel
                    options={leadTypeOptions}
                    placeholder={_ts('leads', 'placeholderAny')}
                    value={filters.type}
                    onChange={this.handleLeadTypeFilterChange}
                    showHintAndError={false}
                />
                <DangerButton
                    disabled={isFilterEmpty}
                    onClick={this.handleClearFilters}
                >
                    {_ts('leads', 'filterClearFilter')}
                </DangerButton>
            </div>
        );
    }
}
