import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    isTruthy,
    isObjectEmpty,
} from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import Button from '../../vendor/react-store/components/Action/Button';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import Form from '../../vendor/react-store/components/Input/Form';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import DateFilter from '../../vendor/react-store/components/Input/DateFilter';
import MultiSelectInput from '../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../rest';
import {
    activeProjectSelector,
    leadFilterOptionsForProjectSelector,

    setLeadPageFilterAction,

    leadPageFilterSelector,
    setLeadFilterOptionsAction,
    unsetLeadPageFilterAction,
    leadsStringsSelector,
} from '../../redux';
import schema from '../../schema';


const propTypes = {
    activeProject: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leadFilterOptions: PropTypes.object.isRequired,

    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    filters: PropTypes.object.isRequired,

    setLeadFilterOptions: PropTypes.func.isRequired,
    setLeadPageFilter: PropTypes.func.isRequired,
    unsetLeadPageFilter: PropTypes.func.isRequired,

    applyOnChange: PropTypes.bool,
    leadsStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    applyOnChange: false,
    filters: {},
    leadFilterOptions: {},
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    filters: leadPageFilterSelector(state),
    leadFilterOptions: leadFilterOptionsForProjectSelector(state, props),
    leadsStrings: leadsStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
    unsetLeadPageFilter: params => dispatch(unsetLeadPageFilterAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class FilterLeadsForm extends React.PureComponent {
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
            pristine: true,
        };

        this.schema = {
            fields: {
                search: [],
                assignee: [],
                created_at: [],
                published_on: [],
                confidentiality: [],
                status: [],
            },
        };
    }

    componentWillMount() {
        const { activeProject } = this.props;
        this.requestProjectLeadFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        const { filters, activeProject } = nextProps;
        if (this.props.filters !== filters) {
            // eslint-disable-next-line no-unused-vars
            const { similar, ...values } = filters;
            this.setState({
                formValues: values,
                pristine: true,
            });
        }

        if (this.props.activeProject !== activeProject) {
            this.requestProjectLeadFilterOptions(activeProject);
        }
    }

    componentWillUnmount() {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }
    }

    // REST

    requestProjectLeadFilterOptions = (activeProject) => {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line max-len
        this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(activeProject);
        this.leadFilterOptionsRequest.start();
    }

    createRequestForProjectLeadFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForLeadFilterOptions(activeProject);

        const leadFilterOptionsRequest = new FgRestBuilder()
            .url(urlForProjectFilterOptions)
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({ loadingLeadFilters: true });
            })
            .postLoad(() => {
                this.setState({ loadingLeadFilters: false });
            })
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
        const { similar } = this.props.filters;
        this.props.setLeadPageFilter({
            filters: {
                ...values,
                similar,
            },
        });
    }

    handleClearSimilarSelection = () => {
        // unsetting only similar from filters
        this.props.setLeadPageFilter({
            filters: {
                ...this.props.filters,
                similar: undefined,
            },
        });
    }

    handleClearFilters = () => {
        if (isObjectEmpty(this.props.filters)) {
            // NOTE: Only clear component state,
            // as the filters in global state is already empty
            this.setState({ formValues: {}, pristine: true });
        } else {
            this.props.unsetLeadPageFilter();
        }
    }

    render() {
        const {
            className,
            leadFilterOptions: {
                confidentiality,
                status,
                assignee,
            },
            filters,
            leadsStrings,
            applyOnChange,
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
                className={`leads-filters ${className}`}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                schema={this.schema}
                value={formValues}
            >
                <MultiSelectInput
                    formname="assignee"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={leadsStrings('assigneeLabel')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={assignee}
                    placeholder={leadsStrings('placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <DateFilter
                    formname="created_at"
                    label={leadsStrings('filterDateCreated')}
                    placeholder={leadsStrings('placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <DateFilter
                    formname="published_on"
                    label={leadsStrings('filterDatePublished')}
                    placeholder={leadsStrings('placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <MultiSelectInput
                    formname="confidentiality"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={leadsStrings('filterConfidentiality')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={confidentiality}
                    placeholder={leadsStrings('placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <MultiSelectInput
                    formname="status"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={leadsStrings('filterStatus')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={status}
                    placeholder={leadsStrings('placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <TextInput
                    formname="search"
                    label={leadsStrings('placeholderSearch')}
                    placeholder={leadsStrings('placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                    type="search"
                />
                { !applyOnChange &&
                    <Button
                        className="button apply-filter-button"
                        disabled={isApplyDisabled}
                    >
                        {leadsStrings('filterApplyFilter')}
                    </Button>
                }
                <DangerButton
                    className="button clear-filter-button"
                    type="button"
                    disabled={isClearDisabled}
                    onClick={this.handleClearFilters}
                >
                    {leadsStrings('filterClearFilter')}
                </DangerButton>
                {
                    isTruthy(filters.similar) && (
                        <DangerButton
                            className="button clear-similar-filter-button"
                            type="button"
                            onClick={this.handleClearSimilarSelection}
                        >
                            {leadsStrings('filterClearSimilarFilter')}
                        </DangerButton>
                    )
                }
            </Form>
        );
    }
}
