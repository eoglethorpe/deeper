import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isObjectEmpty } from '../../../public/utils/common';
import {
    TextInput,
    DateFilter,
    RangeFilter,
    MultiSelectInput,
} from '../../../public/components/Input';
import {
    Button,
    DangerButton,
} from '../../../public/components/Action';
import {
    entryStrings,
} from '../../../common/constants';
import {
    entriesViewFilterSelector,
    setEntriesViewFilterAction,
    unsetEntriesViewFilterAction,
    filtersForProjectSelector,

    projectDetailsSelector,
} from '../../../common/redux';

import GeoSelection from '../../../common/components/GeoSelection';

const mapStateToProps = (state, props) => ({
    entriesFilters: entriesViewFilterSelector(state, props),
    filters: filtersForProjectSelector(state, props),
    projectDetails: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setEntriesViewFilter: params => dispatch(setEntriesViewFilterAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
});

const propTypes = {
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setEntriesViewFilter: PropTypes.func.isRequired,
    unsetEntriesViewFilter: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    applyOnChange: PropTypes.bool,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    pending: true,
    filters: [],
    applyOnChange: false,
};

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class EntriesFilter extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pristine: true,
            filters: this.props.entriesFilters,
        };
    }

    componentWillReceiveProps(nextProps) {
        const { entriesFilters: oldFilter } = this.props;
        const { entriesFilters: newFilter } = nextProps;
        if (oldFilter !== newFilter) {
            this.setState({
                pristine: true,
                filters: newFilter,
            });
        }
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
                    options={filter.options}
                    label={title}
                    showHintAndError={false}
                    onChange={values => this.handleFilterChange(key, values)}
                    value={filters[key]}
                    disabled={this.props.pending}
                />
            );
        } else if (filter.type === 'multiselect-range') {
            return (
                <RangeFilter
                    className="range-filter-container"
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
                    onChange={values => this.handleFilterChange(key, values)}
                    projectId={this.props.projectDetails.id}
                    regions={this.props.projectDetails.regions}
                    value={filters[key] || emptyList}
                    disabled={this.props.pending}
                />
            );
        }

        return null;
    }

    render() {
        const { pending } = this.props;
        const { pristine, filters } = this.state;
        const isFilterEmpty = isObjectEmpty(filters);

        return (
            <div
                key="filters"
                className="entries-filters"
            >
                <TextInput
                    className="entries-filter"
                    key="search"
                    label={entryStrings.searchFilterLabel}
                    onChange={(value) => { this.handleFilterChange('search', value); }}
                    placeholder={entryStrings.searchFilterPlaceholder}
                    showHintAndError={false}
                    value={filters.search}
                    disabled={this.props.pending}
                />
                <MultiSelectInput
                    className="entries-filter"
                    key="created-by"
                    label={entryStrings.createdByFilterLabel}
                    onChange={(value) => { this.handleFilterChange('created_by', value); }}
                    showHintAndError={false}
                    value={filters.created_by}
                    disabled={this.props.pending}
                />
                <DateFilter
                    className="entries-filter"
                    key="created-at"
                    label={entryStrings.createdAtFilterLabel}
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
                            {entryStrings.applyFilterButtonLabel}
                        </Button>
                    )
                }
                <DangerButton
                    className="button reset-filter-button"
                    onClick={this.handleClearFilter}
                    type="button"
                    disabled={pending || isFilterEmpty}
                >
                    {entryStrings.clearFilterButtonLabel}
                </DangerButton>
            </div>
        );
    }
}
