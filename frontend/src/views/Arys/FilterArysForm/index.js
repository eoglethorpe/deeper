import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { isObjectEmpty } from '../../../vendor/react-store/utils/common';
import Button from '../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import Form from '../../../vendor/react-store/components/Input/Form';
import SearchInput from '../../../vendor/react-store/components/Input/SearchInput';
import DateFilter from '../../../vendor/react-store/components/Input/DateFilter';
import MultiSelectInput from '../../../vendor/react-store/components/Input/MultiSelectInput';

import {
    activeProjectSelector,

    setAryPageFilterAction,
    aryPageFilterSelector,
    unsetAryPageFilterAction,
    arysStringsSelector,
    aryFilterOptionsForProjectSelector,
    setAryFilterOptionsAction,
} from '../../../redux';

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
    arysStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    applyOnChange: false,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    filters: aryPageFilterSelector(state),
    aryFilterOptions: aryFilterOptionsForProjectSelector(state, props),
    arysStrings: arysStringsSelector(state),
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
            formValues: this.props.filters,
            pristine: true,
        };

        this.schema = {
            fields: {
                created_at: [],
                created_by: [],
                search: [],
            },
        };
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
                formValues: newFilters,
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

    handleChange = (values) => {
        this.setState(
            {
                formValues: values,
                pristine: false,
            },
            () => {
                if (this.props.applyOnChange) {
                    this.formComponent.submit();
                }
            },
        );
    }

    handleSubmit = (values) => {
        this.props.setAryPageFilter({
            filters: values,
        });
    }

    handleClearFilters = () => {
        if (isObjectEmpty(this.props.filters)) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({ formValues: {}, pristine: true });
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
            arysStrings,
            filters,
        } = this.props;

        const {
            formValues,
            pristine,
        } = this.state;

        const isApplyDisabled = pristine;

        const isFilterEmpty = isObjectEmpty(filters);
        const isClearDisabled = isFilterEmpty && pristine;

        return (
            <Form
                ref={(elem) => { this.formComponent = elem; }}
                className={`arys-filters ${className}`}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                schema={this.schema}
                value={formValues}
            >
                <DateFilter
                    formname="created_at"
                    label={arysStrings('filterDateCreated')}
                    placeholder={arysStrings('placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                />
                <MultiSelectInput
                    className="arys-filter"
                    formname="created_by"
                    keySelector={FilterArysForm.optionKeySelector}
                    label={arysStrings('createdByFilterLabel')}
                    labelSelector={FilterArysForm.optionLabelSelector}
                    options={createdBy}
                    placeholder={arysStrings('placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                />
                <SearchInput
                    formname="search"
                    label={arysStrings('placeholderSearch')}
                    placeholder={arysStrings('placeholderSearch')}
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
                        {arysStrings('filterApplyFilter')}
                    </Button>
                }
                <DangerButton
                    className="button clear-filter-button"
                    disabled={isClearDisabled}
                    onClick={this.handleClearFilters}
                >
                    {arysStrings('filterClearFilter')}
                </DangerButton>
            </Form>
        );
    }
}
