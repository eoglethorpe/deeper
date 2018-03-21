/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { BgRestBuilder } from '../../vendor/react-store/utils/rest';
import MultiSelectInput from '../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';

import {
    activeProjectSelector,
    addLeadViewSetFiltersAction,
    addLeadViewUnsetFiltersAction,
    addLeadViewFiltersSelector,
    addLeadViewIsFilterEmptySelector,
    setLeadFilterOptionsAction,
    leadsStringsSelector,
} from '../../redux';
import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../rest';
import {
    LEAD_TYPE,
    LEAD_FILTER_STATUS,
} from '../../entities/lead';
import schema from '../../schema';

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
    leadsStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    filters: addLeadViewFiltersSelector(state),
    isFilterEmpty: addLeadViewIsFilterEmptySelector(state),
    leadsStrings: leadsStringsSelector(state),
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
        const leadFilterOptionsRequest = new BgRestBuilder()
            .url(createUrlForLeadFilterOptions(activeProject))
            .params(() => createParamsForUser())
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
                <TextInput
                    label={this.props.leadsStrings('placeholderSearch')}
                    onChange={this.handleSearchChange}
                    value={filters.search}
                    placeholder={this.props.leadsStrings('placeholderSearch')}
                    type="search"
                    showHintAndError={false}
                />
                <TextInput
                    label={this.props.leadsStrings('filterPublisher')}
                    placeholder={this.props.leadsStrings('placeholderAny')}
                    value={filters.source}
                    onChange={this.handleLeadSourceFilterChange}
                    showHintAndError={false}
                />
                <SelectInput
                    label={this.props.leadsStrings('filterStatus')}
                    showLabel
                    options={leadStatusFilterOptions}
                    placeholder={this.props.leadsStrings('placeholderAny')}
                    value={filters.status}
                    optionsIdentifier="lead-list-filter-options"
                    onChange={this.handleLeadStatusFilterChange}
                    showHintAndError={false}
                />
                <MultiSelectInput
                    label={this.props.leadsStrings('filterSourceType')}
                    showLabel
                    options={leadTypeOptions}
                    placeholder={this.props.leadsStrings('placeholderAny')}
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
                    {this.props.leadsStrings('filterClearFilter')}
                </DangerButton>
            </div>
        );
    }
}
