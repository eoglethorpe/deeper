import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    isTruthy,
    isObjectEmpty,
} from '../../vendor/react-store/utils/common';
import Button from '../../vendor/react-store/components/Action/Button';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import Form from '../../vendor/react-store/components/Input/Form';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import DateFilter from '../../vendor/react-store/components/Input/DateFilter';
import MultiSelectInput from '../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';

import {
    activeProjectSelector,

    setAryPageFilterAction,
    aryPageFilterSelector,
    unsetAryPageFilterAction,
    arysStringsSelector,
    aryFilterOptionsForProjectSelector,
    setAryFilterOptionsAction,
} from '../../redux';

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
        // eslint-disable-next-line no-unused-vars
        const { similar, ...values } = this.props.filters;
        this.state = {
            formValues: values,
            pristine: false,
        };

        this.formElements = [
            'search',
            'created_at',
            'created_by',
        ];
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
            const { similar, ...values } = newFilters;
            this.setState({
                formValues: values,
                pristine: false,
            });
        }

        if (oldActiveProject !== newActiveProject) {
            this.requestProjectAryFilterOptions(newActiveProject);
        }
    }

    requestProjectAryFilterOptions = (activeProject) => {
        if (this.aryFilterOptionsRequest) {
            this.aryFilterOptionsRequest.stop();
        }

        const aryFilterOptionsGetRequest = new AryFilterOptionsGetRequest(
            this, { setAryFilterOptions: this.props.setAryFilterOptions },
        );

        this.aryFilterOptionsRequest = aryFilterOptionsGetRequest.create(activeProject);
        this.aryFilterOptionsRequest.start();
    }

    // UI

    handleChange = (values) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            pristine: true,
        }, () => {
            if (this.props.applyOnChange) {
                this.formComponent.submit();
            }
        });
    }

    handleSubmit = (values) => {
        this.setState({ pristine: false });
        this.props.setAryPageFilter({
            filters: values,
        });
    }

    handleClearSimilarSelection = () => {
        this.props.setAryPageFilter({
            filters: { similar: undefined },
        });
    }

    handleClearFilters = () => {
        if (!this.state.pristine) {
            this.props.unsetAryPageFilter();
        } else {
            this.setState({
                formValues: {},
            });
        }
    }

    render() {
        const {
            className,
            aryFilterOptions,
        } = this.props;

        const {
            formValues,
            pristine,
        } = this.state;

        const isFilterEmpty = isObjectEmpty(formValues);

        const { createdBy } = aryFilterOptions;

        return (
            <Form
                ref={(elem) => { this.formComponent = elem; }}
                className={`arys-filters ${className}`}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                elements={this.formElements}
                value={formValues}
            >
                <DateFilter
                    formname="created_at"
                    label={this.props.arysStrings('filterDateCreated')}
                    placeholder={this.props.arysStrings('placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                />
                <MultiSelectInput
                    className="arys-filter"
                    formname="created_by"
                    keySelector={FilterArysForm.optionKeySelector}
                    label={this.props.arysStrings('createdByFilterLabel')}
                    labelSelector={FilterArysForm.optionLabelSelector}
                    options={createdBy}
                    placeholder={this.props.arysStrings('placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                />
                <TextInput
                    formname="search"
                    label={this.props.arysStrings('placeholderSearch')}
                    placeholder={this.props.arysStrings('placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="arys-filter"
                    type="search"
                />
                { !this.props.applyOnChange &&
                    <Button
                        className="button apply-filter-button"
                        disabled={!pristine}
                    >
                        {this.props.arysStrings('filterApplyFilter')}
                    </Button>
                }
                <DangerButton
                    className="button clear-filter-button"
                    type="button"
                    disabled={isFilterEmpty}
                    onClick={this.handleClearFilters}
                >
                    {this.props.arysStrings('filterClearFilter')}
                </DangerButton>
                {
                    isTruthy(this.props.filters.similar) && (
                        <DangerButton
                            className="button clear-similar-filter-button"
                            type="button"
                            onClick={this.handleClearSimilarSelection}
                        >
                            {this.props.arysStrings('filterClearSimilarFilter')}
                        </DangerButton>
                    )
                }
            </Form>
        );
    }
}
