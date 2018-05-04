import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isObjectEmpty } from '../../../vendor/react-store/utils/common';
import Button from '../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import Faram from '../../../vendor/react-store/components/Input/Faram';
import SearchInput from '../../../vendor/react-store/components/Input/SearchInput';
import DateFilter from '../../../vendor/react-store/components/Input/DateFilter';
import MultiSelectInput from '../../../vendor/react-store/components/Input/MultiSelectInput';

import {
    activeProjectIdFromStateSelector,

    setAryPageFilterAction,
    aryPageFilterSelector,
    unsetAryPageFilterAction,
    aryFilterOptionsForProjectSelector,
    setAryFilterOptionsAction,
} from '../../../redux';
import _ts from '../../../ts';

import AryFilterOptionsGetRequest from './requests/AryFilterOptionsGetRequest';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types

    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setAryPageFilter: PropTypes.func.isRequired,
    unsetAryPageFilter: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    aryFilterOptions: PropTypes.object.isRequired,
    setAryFilterOptions: PropTypes.func.isRequired,

    applyOnChange: PropTypes.bool,
};

const defaultProps = {
    className: '',
    applyOnChange: false,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),
    filters: aryPageFilterSelector(state),
    aryFilterOptions: aryFilterOptionsForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setAryPageFilter: params => dispatch(setAryPageFilterAction(params)),
    setAryFilterOptions: params => dispatch(setAryFilterOptionsAction(params)),
    unsetAryPageFilter: params => dispatch(unsetAryPageFilterAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterArysForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);
        this.state = {
            faramValues: this.props.filters,
            pristine: true,
        };

        this.schema = {
            fields: {
                created_at: [],
                created_by: [],
                search: [],
            },
        };

        this.faramRef = React.createRef();
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.requestProjectAryFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        const {
            filters: oldFilters,
            activeProject: oldActiveProject,
        } = this.props;
        const {
            filters: newFilters,
            activeProject: newActiveProject,
        } = nextProps;

        if (oldFilters !== newFilters) {
            // eslint-disable-next-line no-unused-vars
            this.setState({
                faramValues: newFilters,
                pristine: true,
            });
        }

        if (oldActiveProject !== newActiveProject) {
            this.requestProjectAryFilterOptions(newActiveProject);
        }
    }

    componentWillUnmount() {
        if (this.aryFilterOptionsRequest) {
            this.aryFilterOptionsRequest.stop();
        }
    }

    requestProjectAryFilterOptions = (activeProject) => {
        if (this.aryFilterOptionsRequest) {
            this.aryFilterOptionsRequest.stop();
        }

        const aryFilterOptionsGetRequest = new AryFilterOptionsGetRequest({
            setState: params => this.setState(params),
            setAryFilterOptions: this.props.setAryFilterOptions,
        });

        this.aryFilterOptionsRequest = aryFilterOptionsGetRequest.create(activeProject);
        this.aryFilterOptionsRequest.start();
    }

    // UI

    handleFaramChange = (values) => {
        this.setState(
            {
                faramValues: values,
                pristine: false,
            },
            () => {
                if (this.props.applyOnChange) {
                    this.faramRef.current.submit();
                }
            },
        );
    }

    handleFaramValidationSuccess = (values) => {
        this.props.setAryPageFilter({
            filters: values,
        });
    }

    handleClearFilters = () => {
        if (isObjectEmpty(this.props.filters)) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({ faramValues: {}, pristine: true });
        } else {
            this.props.unsetAryPageFilter();
        }
    }

    render() {
        const {
            className,
            aryFilterOptions: {
                createdBy,
            },
            applyOnChange,
            filters,
        } = this.props;

        const {
            faramValues,
            pristine,
        } = this.state;

        const isApplyDisabled = pristine;

        const isFilterEmpty = isObjectEmpty(filters);
        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Faram
                ref={this.faramRef}
                className={`arys-filters ${className}`}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
            >
                <DateFilter
                    faramElementName="created_at"
                    label={_ts('arys', 'filterDateCreated')}
                    placeholder={_ts('arys', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                />
                <MultiSelectInput
                    className="arys-filter"
                    faramElementName="created_by"
                    keySelector={FilterArysForm.optionKeySelector}
                    label={_ts('arys', 'createdByFilterLabel')}
                    labelSelector={FilterArysForm.optionLabelSelector}
                    options={createdBy}
                    placeholder={_ts('arys', 'placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                />
                <SearchInput
                    faramElementName="search"
                    label={_ts('arys', 'placeholderSearch')}
                    placeholder={_ts('arys', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                />
                { !applyOnChange &&
                    <Button
                        className="button apply-filter-button"
                        disabled={isApplyDisabled}
                        type="submit"
                    >
                        {_ts('arys', 'filterApplyFilter')}
                    </Button>
                }
                <DangerButton
                    className="button clear-filter-button"
                    disabled={isClearDisabled}
                    onClick={this.handleClearFilters}
                >
                    {_ts('arys', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        );
    }
}
