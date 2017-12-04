import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Button,
    DangerButton,
} from '../../../../../../public/components/Action';
import {
    Form,
    SelectInput,
    TextInput,
    DateFilter,
} from '../../../../../../public/components/Input';
import { RestBuilder } from '../../../../../../public/utils/rest';
import {
    isTruthy,
    isObjectEmpty,
} from '../../../../../../public/utils/common';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../../../../../common/rest';
import {
    activeProjectSelector,
    leadFilterOptionsForProjectSelector,

    setLeadPageFilterAction,

    tokenSelector,

    setLeadFilterOptionsAction,
    unsetLeadPageFilterAction,
} from '../../../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    className: PropTypes.string,
    setLeadFilterOptions: PropTypes.func.isRequired,
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line 
    value:  PropTypes.object.isRequired, // eslint-disable-line
    setLeadPageFilter: PropTypes.func.isRequired,
    unsetLeadPageFilter: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    leadFilterOptions: leadFilterOptionsForProjectSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
    unsetLeadPageFilter: params => dispatch(unsetLeadPageFilterAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class FilterLeadsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);
        // eslint-disable-next-line no-unused-vars
        const { similar, ...values } = this.props.value;
        this.state = {
            formValues: values,
            stale: false,
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
        const { value, activeProject } = nextProps;
        if (this.props.value !== value) {
            // eslint-disable-next-line no-unused-vars
            const { similar, ...values } = value;
            this.setState({
                formValues: values,
                stale: false,
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

        const leadFilterOptionsRequest = new RestBuilder()
            .url(urlForProjectFilterOptions)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .retryTime(1000)
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
            stale: true,
        });
    }

    handleSubmit = (values) => {
        this.setState({ stale: false });
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
        if (!this.state.stale) {
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
            stale,
        } = this.state;

        const {
            confidentiality,
            status,
            assignee,
        } = leadFilterOptions;

        const isFilterEmpty = isObjectEmpty(formValues);

        return (
            <Form
                styleName="filters"
                className={className}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                elements={this.formElements}
            >
                <SelectInput
                    formname="assignee"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label="Assigned to"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    multiple
                    options={assignee}
                    placeholder="Anybody"
                    showHintAndError={false}
                    showLabel
                    styleName="filter"
                    value={formValues.assignee}
                />
                <DateFilter
                    formname="created_at"
                    label="Created at"
                    placeholder="Anytime"
                    showHintAndError={false}
                    showLabel
                    styleName="filter"
                    value={formValues.created_at}
                />
                <DateFilter
                    formname="published_on"
                    label="Published on"
                    placeholder="Anytime"
                    showHintAndError={false}
                    showLabel
                    styleName="filter"
                    value={formValues.published_on}
                />
                <SelectInput
                    formname="confidentiality"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label="Confidentiality"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    multiple
                    options={confidentiality}
                    placeholder="Any"
                    showHintAndError={false}
                    showLabel
                    styleName="filter"
                    value={formValues.confidentiality}
                />
                <SelectInput
                    formname="status"
                    keySelector={FilterLeadsForm.optionKeySelector}
                    label="Status"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    multiple
                    options={status}
                    placeholder="Any"
                    showHintAndError={false}
                    showLabel
                    styleName="filter"
                    value={formValues.status}
                />
                <TextInput
                    formname="search"
                    label="Search"
                    placeholder="Nepal"
                    showHintAndError={false}
                    showLabel
                    styleName="filter"
                    type="search"
                    value={formValues.search}
                />
                <Button
                    styleName="filter-btn"
                    disabled={!stale}
                >
                    Apply Filter
                </Button>
                <DangerButton
                    styleName="filter-btn"
                    type="button"
                    disabled={isFilterEmpty}
                    onClick={this.handleClearFilters}
                >
                    Clear Filter
                </DangerButton>
                {
                    isTruthy(this.props.value.similar) && (
                        <DangerButton
                            styleName="filter-btn"
                            type="button"
                            onClick={this.handleClearSimilarSelection}
                        >
                            Clear Similarity Filter
                        </DangerButton>
                    )
                }
            </Form>
        );
    }
}
