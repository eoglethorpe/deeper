import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { isObjectEmpty } from '../../vendor/react-store/utils/common';
import SearchInput from '../../vendor/react-store/components/Input/SearchInput';
import DateFilter from '../../vendor/react-store/components/Input/DateFilter';
import RangeFilter from '../../vendor/react-store/components/Input/RangeFilter';
import MultiSelectInput from '../../vendor/react-store/components/Input/MultiSelectInput';
import Button from '../../vendor/react-store/components/Action/Button';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';

import {
    activeProjectIdFromStateSelector,
    entriesViewFilterSelector,
    setEntriesViewFilterAction,
    unsetEntriesViewFilterAction,
    filtersForProjectSelector,

    projectDetailsSelector,
    entryFilterOptionsForProjectSelector,
    setEntryFilterOptionsAction,
    setGeoOptionsAction,
    geoOptionsForProjectSelector,
} from '../../redux';
import {
    createUrlForGeoOptions,

    createParamsForGet,
    createUrlForEntryFilterOptions,

    transformResponseErrorToFormError,
} from '../../rest';
import schema from '../../schema';
import notify from '../../notify';
import _ts from '../../ts';
import GeoSelection from '../../components/GeoSelection';

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),
    entriesFilters: entriesViewFilterSelector(state, props),
    filters: filtersForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
    entryFilterOptions: entryFilterOptionsForProjectSelector(state, props),
    geoOptions: geoOptionsForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setEntriesViewFilter: params => dispatch(setEntriesViewFilterAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),

    setEntryFilterOptions: params => dispatch(setEntryFilterOptionsAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
});

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setEntriesViewFilter: PropTypes.func.isRequired,
    unsetEntriesViewFilter: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    applyOnChange: PropTypes.bool,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    // eslint-disable-next-line react/forbid-prop-types
    entryFilterOptions: PropTypes.object.isRequired,
    setEntryFilterOptions: PropTypes.func.isRequired,
};

const defaultProps = {
    pending: true,
    filters: [],
    geoOptions: {},
    applyOnChange: false,
};

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterEntriesForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);

        this.state = {
            pristine: true,
            geoSelectionEnable: false,
            filters: this.props.entriesFilters,
        };
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.requestProjectEntryFilterOptions(activeProject);

        this.geoOptionsRequest = this.createGeoOptionsRequest(activeProject);
        this.geoOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            entriesFilters: oldFilter,
            activeProject: oldActiveProject,
        } = this.props;
        const {
            entriesFilters: newFilter,
            activeProject: newActiveProject,
        } = nextProps;

        if (oldFilter !== newFilter) {
            this.setState({
                pristine: true,
                filters: newFilter,
            });
        }

        if (oldActiveProject !== newActiveProject) {
            this.requestProjectEntryFilterOptions(newActiveProject);
        }
    }


    componentWillUnmount() {
        this.entryFilterOptionsRequest.stop();

        if (this.geoOptionsRequest) {
            this.geoOptionsRequest.stop();
        }
    }

    // REST

    createGeoOptionsRequest = (projectId) => {
        const geoOptionsRequest = new FgRestBuilder()
            .url(createUrlForGeoOptions(projectId))
            .params(createParamsForGet)
            .preLoad(() => this.setState({ geoSelectionEnable: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'geoOptions');
                    this.props.setGeoOptions({
                        projectId,
                        locations: response,
                    });
                    this.setState({ geoSelectionEnable: true });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.warn(response);
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('entry', 'entriesTabLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('entry', 'entriesTabLabel'),
                    type: notify.type.ERROR,
                    message: _ts('entry', 'geoOptionsFatalMessage'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return geoOptionsRequest;
    };

    requestProjectEntryFilterOptions = (activeProject) => {
        if (this.entryFilterOptionsRequest) {
            this.entryFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line max-len
        this.entryFilterOptionsRequest = this.createRequestForProjectEntryFilterOptions(activeProject);
        this.entryFilterOptionsRequest.start();
    }

    createRequestForProjectEntryFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForEntryFilterOptions(activeProject);

        const entryFilterOptionsRequest = new FgRestBuilder()
            .url(urlForProjectFilterOptions)
            .params(createParamsForGet)
            .preLoad(() => {
                // FIXME: use this
                this.setState({ loadingEntryFilters: true });
            })
            .postLoad(() => {
                // FIXME: use this
                this.setState({ loadingEntryFilters: false });
            })
            .success((response) => {
                try {
                    // schema.validate(response, 'projectEntryFilterOptions');
                    this.props.setEntryFilterOptions({
                        projectId: activeProject,
                        entryFilterOptions: response,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .build();

        return entryFilterOptionsRequest;
    }


    handleApplyFilter = () => {
        const { filters } = this.state;
        this.props.setEntriesViewFilter({ filters });
    }

    handleClearFilter = () => {
        const { pristine } = this.state;
        if (pristine) {
            this.props.unsetEntriesViewFilter();
        } else {
            this.setState({ filters: {} });
        }
    }

    handleFilterChange = (key, values) => {
        const filters = {
            ...this.state.filters,
            ...{ [key]: values },
        };
        this.setState({
            filters,
            pristine: false,
        }, () => {
            if (this.props.applyOnChange) {
                this.handleApplyFilter();
            }
        });
    }


    renderFilter = ({ title, key, properties: filter }) => {
        const { filters } = this.state;

        if (!filter || !filter.type) {
            return null;
        }

        if (filter.type === 'multiselect') {
            return (
                <MultiSelectInput
                    key={key}
                    className="entries-filter"
                    options={filter.options || emptyList}
                    label={title}
                    showHintAndError={false}
                    onChange={values => this.handleFilterChange(key, values)}
                    value={filters[key] || emptyList}
                    disabled={this.props.pending}
                />
            );
        } else if (filter.type === 'multiselect-range') {
            return (
                <RangeFilter
                    className="range-filter entries-filter"
                    key={key}
                    options={filter.options}
                    label={title}
                    showHintAndError={false}
                    onChange={values => this.handleFilterChange(key, values)}
                    value={filters[key]}
                    disabled={this.props.pending}
                />
            );
        } else if (filter.type === 'date') {
            return (
                <DateFilter
                    key={key}
                    className="entries-filter"
                    label={title}
                    showHintAndError={false}
                    onChange={values => this.handleFilterChange(key, values)}
                    value={filters[key]}
                    disabled={this.props.pending}
                />
            );
        } else if (filter.type === 'geo') {
            // User GeoSelect component
            return (
                <GeoSelection
                    key={key}
                    className="entries-filter"
                    label={title}
                    geoOptions={this.props.geoOptions}
                    onChange={values => this.handleFilterChange(key, values)}
                    regions={this.props.projectDetails.regions}
                    value={filters[key] || emptyList}
                    disabled={this.props.pending && this.state.geoSelectionEnable}
                    hideList
                />
            );
        }

        return null;
    }

    render() {
        const { pending, entryFilterOptions } = this.props;
        const { pristine, filters } = this.state;
        const isFilterEmpty = isObjectEmpty(filters);

        const { createdBy } = entryFilterOptions;

        return (
            <div
                key="filters"
                className="entries-filters"
            >
                <SearchInput
                    className="entries-filter"
                    key="search"
                    label={_ts('entry', 'searchFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('search', value); }}
                    placeholder={_ts('entry', 'searchFilterPlaceholder')}
                    showHintAndError={false}
                    value={filters.search}
                    disabled={this.props.pending}
                />
                <MultiSelectInput
                    className="entries-filter"
                    key="created-by"
                    keySelector={FilterEntriesForm.optionKeySelector}
                    labelSelector={FilterEntriesForm.optionLabelSelector}
                    options={createdBy}
                    label={_ts('entry', 'createdByFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('created_by', value); }}
                    showHintAndError={false}
                    value={filters.created_by || emptyList}
                    disabled={this.props.pending}
                />
                <DateFilter
                    className="entries-filter"
                    key="created-at"
                    label={_ts('entry', 'createdAtFilterLabel')}
                    onChange={(value) => { this.handleFilterChange('created_at', value); }}
                    showHintAndError={false}
                    value={filters.created_at}
                    disabled={this.props.pending}
                />
                { this.props.filters.map(this.renderFilter) }
                {
                    !this.props.applyOnChange && (
                        <Button
                            className="button apply-filter-button"
                            onClick={this.handleApplyFilter}
                            disabled={pending || pristine}
                        >
                            {_ts('entry', 'applyFilterButtonLabel')}
                        </Button>
                    )
                }
                <DangerButton
                    className="button reset-filter-button"
                    onClick={this.handleClearFilter}
                    disabled={pending || isFilterEmpty}
                >
                    {_ts('entry', 'clearFilterButtonLabel')}
                </DangerButton>
            </div>
        );
    }
}
