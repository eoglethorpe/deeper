import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isObjectEmpty } from '../../../public/utils/common';
import { SelectInput } from '../../../public/components/Input';
import {
    Button,
    DangerButton,
} from '../../../public/components/Action';

import {
    entriesViewFilterSelector,
    setEntriesViewFilterAction,
    unsetEntriesViewFilterAction,
    filtersForProjectSelector,
} from '../../../common/redux';

import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    entriesFilters: entriesViewFilterSelector(state, props),
    filters: filtersForProjectSelector(state, props),
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
};

const defaultProps = {
    pending: true,
    filters: [],
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
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
        });
    }


    renderFilter = ({ key, properties: filter }) => {
        const { filters } = this.state;

        if (!filter || !filter.type) {
            return null;
        }

        if (filter.type === 'multiselect') {
            return (
                <SelectInput
                    key={key}
                    className={styles.filter}
                    options={filter.options}
                    label={key}
                    showHintAndError={false}
                    onChange={values => this.handleFilterChange(key, values)}
                    value={filters[key] || []}
                    disabled={this.props.pending}
                    multiple
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
                styleName="filters"
            >
                { this.props.filters.map(this.renderFilter) }
                { this.props.filters.length > 0 &&
                    [
                        <Button
                            key="apply-btn"
                            styleName="filter-btn"
                            onClick={this.handleApplyFilter}
                            disabled={pending || pristine}
                        >
                            Apply Filter
                        </Button>,
                        <DangerButton
                            key="clear-btn"
                            styleName="filter-btn"
                            onClick={this.handleClearFilter}
                            type="button"
                            disabled={pending || isFilterEmpty}
                        >
                            Clear Filter
                        </DangerButton>,
                    ]
                }
            </div>
        );
    }
}
