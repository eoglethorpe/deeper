import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Button, TransparentButton } from '../../../../public/components/Action';
import {
    Form,
    SelectInput,
    DateFilter,
} from '../../../../public/components/Input';

import { RestBuilder } from '../../../../public/utils/rest';
import { isTruthy } from '../../../../public/utils/common';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    leadFilterOptionsForProjectSelector,

    tokenSelector,

    setLeadFilterOptionsAction,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    className: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    setLeadFilterOptions: PropTypes.func.isRequired,
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line 
    value:  PropTypes.object.isRequired, // eslint-disable-line
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
        this.state = {
            formValues: this.props.value,
            stale: false,
        };

        this.formElements = [
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
            this.setState({ formValues: value });
        }
        if (this.props.activeProject !== activeProject) {
            this.requestProjectLeadFilterOptions(activeProject);
        }
    }

    clearSimilarselection = () => {
        this.handleChange({
            selected: undefined,
        });
    }

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
            .retryTime(1000)
            .build();

        return leadFilterOptionsRequest;
    }

    handleChange = (values) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            stale: true,
        });
    }

    handleSubmit = (values) => {
        this.setState({
            stale: false,
        });
        this.props.onSubmit(values);
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

        return (
            <Form
                styleName="filters"
                className={className}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                elements={this.formElements}
            >
                <SelectInput
                    label="Assigned to"
                    showLabel
                    placeholder="Anybody"
                    formname="assignee"
                    options={assignee}
                    styleName="filter"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    keySelector={FilterLeadsForm.optionKeySelector}
                    value={formValues.assignee}
                    multiple
                />
                <DateFilter
                    label="Created at"
                    showLabel
                    placeholder="Anytime"
                    formname="created_at"
                    styleName="filter"
                    value={formValues.created_at}
                />
                <DateFilter
                    label="Published on"
                    showLabel
                    placeholder="Anytime"
                    formname="published_on"
                    styleName="filter"
                    value={formValues.published_on}
                />
                <SelectInput
                    label="Confidentiality"
                    showLabel
                    placeholder="Any"
                    formname="confidentiality"
                    options={confidentiality}
                    styleName="filter"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    keySelector={FilterLeadsForm.optionKeySelector}
                    value={formValues.confidentiality}
                />
                <SelectInput
                    label="Status"
                    showLabel
                    placeholder="Any"
                    formname="status"
                    options={status}
                    styleName="filter"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    keySelector={FilterLeadsForm.optionKeySelector}
                    value={formValues.status}
                />
                <div
                    styleName="filter"
                    hidden={isTruthy(formValues.similarLead)}
                >
                    {formValues.similarLead}
                </div>
                {isTruthy(formValues.similar) && (
                    <div
                        styleName="filter similar"
                    >
                        Showing similar leads
                        <TransparentButton
                            onClick={this.clearSimilarselection}
                        >
                            <span className="ion-android-close" />
                        </TransparentButton>
                    </div>
                )}
                <Button
                    styleName="apply-filter-btn"
                    disabled={!stale}
                >
                    Apply Filter
                </Button>
            </Form>
        );
    }
}
