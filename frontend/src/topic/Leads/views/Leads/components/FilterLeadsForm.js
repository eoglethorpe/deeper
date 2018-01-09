import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Button,
    DangerButton,
} from '../../../../../public/components/Action';
import {
    Form,
    SelectInput,
    TextInput,
    DateFilter,
} from '../../../../../public/components/Input';
import { FgRestBuilder } from '../../../../../public/utils/rest';
import {
    isTruthy,
    isObjectEmpty,
} from '../../../../../public/utils/common';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../../../../common/rest';
import {
    activeProjectSelector,
    leadFilterOptionsForProjectSelector,

    setLeadPageFilterAction,

    leadPageFilterSelector,
    setLeadFilterOptionsAction,
    unsetLeadPageFilterAction,
} from '../../../../../common/redux';

import {
    leadsString,
} from '../../../../../common/constants';

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
};

const defaultProps = {
    className: '',
    applyOnChange: false,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    filters: leadPageFilterSelector(state),
    leadFilterOptions: leadFilterOptionsForProjectSelector(state, props),
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
            pristine: false,
        };

        this.formElements = [
            'search',
            'assignee',
            'created_at',
            'published_on',
            'confidentiality',
            'status',
        ];
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
                pristine: false,
            });
        }

        if (this.props.activeProject !== activeProject) {
            this.requestProjectLeadFilterOptions(activeProject);
        }
    }

    componentWillUnmount() {
        this.leadFilterOptionsRequest.stop();
    }

    // REST

    requestProjectLeadFilterOptions = (activeProject) => {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line
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
                    // TODO:
                    // schema.validate(response, 'leadFilterOptionsGetResponse');
                    this.props.setLeadFilterOptions({
                        projectId: activeProject,
                        leadFilterOptions: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();

        return leadFilterOptionsRequest;
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
        this.props.setLeadPageFilter({
            filters: values,
        });
    }

    handleClearSimilarSelection = () => {
        this.props.setLeadPageFilter({
            filters: { similar: undefined },
        });
    }

    handleClearFilters = () => {
        if (!this.state.pristine) {
            this.props.unsetLeadPageFilter();
        } else {
            this.setState({
                formValues: {},
            });
        }
    }

    render() {
        const {
            className,
            leadFilterOptions,
        } = this.props;

        const {
            formValues,
            pristine,
        } = this.state;

        const {
            confidentiality,
            status,
            assignee,
        } = leadFilterOptions;

        const isFilterEmpty = isObjectEmpty(formValues);

        return (
            <Form
                ref={(elem) => { this.formComponent = elem; }}
                className={`leads-filters ${className}`}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                elements={this.formElements}
            >
                <SelectInput
                    formname="assignee"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={leadsString.assigneeLabel}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    multiple
                    options={assignee}
                    placeholder={leadsString.placeholderAnybody}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                    value={formValues.assignee}
                />
                <DateFilter
                    formname="created_at"
                    label={leadsString.filterDateCreated}
                    placeholder={leadsString.placeholderAnytime}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                    value={formValues.created_at}
                />
                <DateFilter
                    formname="published_on"
                    label={leadsString.filterDatePublished}
                    placeholder={leadsString.placeholderAnytime}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                    value={formValues.published_on}
                />
                <SelectInput
                    formname="confidentiality"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={leadsString.filterConfidentiality}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    multiple
                    options={confidentiality}
                    placeholder={leadsString.placeholderAny}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                    value={formValues.confidentiality}
                />
                <SelectInput
                    formname="status"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={leadsString.filterStatus}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    multiple
                    options={status}
                    placeholder={leadsString.placeholderAny}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                    value={formValues.status}
                />
                <TextInput
                    formname="search"
                    label={leadsString.placeholderSearch}
                    placeholder={leadsString.placeholderSearch}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                    type="search"
                    value={formValues.search}
                />
                { !this.props.applyOnChange &&
                    <Button
                        className="button apply-filter-button"
                        disabled={!pristine}
                    >
                        {leadsString.filterApplyFilter}
                    </Button>
                }
                <DangerButton
                    className="button clear-filter-button"
                    type="button"
                    disabled={isFilterEmpty}
                    onClick={this.handleClearFilters}
                >
                    {leadsString.filterClearFilter}
                </DangerButton>
                {
                    isTruthy(this.props.filters.similar) && (
                        <DangerButton
                            className="button clear-similar-filter-button"
                            type="button"
                            onClick={this.handleClearSimilarSelection}
                        >
                            {leadsString.filterClearSimilarFilter}
                        </DangerButton>
                    )
                }
            </Form>
        );
    }
}
