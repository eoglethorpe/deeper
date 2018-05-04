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
import Faram from '../../vendor/react-store/components/Input/Faram';
import SearchInput from '../../vendor/react-store/components/Input/SearchInput';
import DateFilter from '../../vendor/react-store/components/Input/DateFilter';
import MultiSelectInput from '../../vendor/react-store/components/Input/MultiSelectInput';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../rest';
import {
    activeProjectIdFromStateSelector,
    leadFilterOptionsForProjectSelector,

    setLeadPageFilterAction,

    leadPageFilterSelector,
    setLeadFilterOptionsAction,
    unsetLeadPageFilterAction,
} from '../../redux';
import _ts from '../../ts';
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
};

const defaultProps = {
    className: '',
    applyOnChange: false,
    filters: {},
    leadFilterOptions: {},
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),
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
            faramValues: values,
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
                faramValues: values,
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

    handleFaramChange = (values) => {
        this.setState(
            {
                faramValues: values,
                pristine: false,
            },
            () => {
                if (this.props.applyOnChange) {
                    this.faramComponent.submit();
                }
            },
        );
    }

    handleFaramValidationSuccess = (values) => {
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
            this.setState({ faramValues: {}, pristine: true });
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
            applyOnChange,
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
                ref={(elem) => { this.faramComponent = elem; }}
                className={`leads-filters ${className}`}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onChange={this.handleFaramChange}
                schema={this.schema}
                value={faramValues}
            >
                <MultiSelectInput
                    faramElementName="assignee"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={_ts('leads', 'assigneeLabel')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={assignee}
                    placeholder={_ts('leads', 'placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <DateFilter
                    faramElementName="created_at"
                    label={_ts('leads', 'filterDateCreated')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <DateFilter
                    faramElementName="published_on"
                    label={_ts('leads', 'filterDatePublished')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <MultiSelectInput
                    faramElementName="confidentiality"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={_ts('leads', 'filterConfidentiality')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={confidentiality}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <MultiSelectInput
                    faramElementName="status"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label={_ts('leads', 'filterStatus')}
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    options={status}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                <SearchInput
                    faramElementName="search"
                    label={_ts('leads', 'placeholderSearch')}
                    placeholder={_ts('leads', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className="leads-filter"
                />
                { !applyOnChange &&
                    <Button
                        className="button apply-filter-button"
                        disabled={isApplyDisabled}
                        type="submit"
                    >
                        {_ts('leads', 'filterApplyFilter')}
                    </Button>
                }
                <DangerButton
                    className="button clear-filter-button"
                    disabled={isClearDisabled}
                    onClick={this.handleClearFilters}
                >
                    {_ts('leads', 'filterClearFilter')}
                </DangerButton>
                {
                    isTruthy(filters.similar) && (
                        <DangerButton
                            className="button clear-similar-filter-button"
                            onClick={this.handleClearSimilarSelection}
                        >
                            {_ts('leads', 'filterClearSimilarFilter')}
                        </DangerButton>
                    )
                }
            </Faram>
        );
    }
}
