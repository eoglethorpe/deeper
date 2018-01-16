import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    DateInput,
    SelectInput,
    MultiSelectInput,
    TextInput,
    Form,
    requiredCondition,
    urlCondition,
} from '../public-components/Input';

import { FgRestBuilder } from '../public/utils/rest';

import { LoadingAnimation } from '../public-components/View';
import {
    TransparentButton,
    PrimaryButton,
} from '../public-components/Action';

import {
    updateInputValuesAction,
    clearInputValueAction,
    setProjectListAction,
    inputValuesForTabSelector,
    currentTabIdSelector,
    projectListSelector,
    setLeadOptionsAction,
    leadOptionsSelector,
} from '../common/redux';

import {
    createUrlForProjectList,
    createParamsForProjectList,

    createUrlForLeadOptions,
    createParamsForLeadOptions,

    urlForLeadCreate,
    createParamsForLeadCreate,
} from '../common/rest';

import styles from '../stylesheets/add-lead.scss';

const mapStateToProps = state => ({
    inputValues: inputValuesForTabSelector(state),
    currentTabId: currentTabIdSelector(state),
    projects: projectListSelector(state),
    leadOptions: leadOptionsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateInputValues: params => dispatch(updateInputValuesAction(params)),
    clearInputValue: params => dispatch(clearInputValueAction(params)),
    setProjectList: params => dispatch(setProjectListAction(params)),
    setLeadOptions: params => dispatch(setLeadOptionsAction(params)),
});

const propTypes = {
    inputValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    currentTabId: PropTypes.string.isRequired,
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    leadOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
    updateInputValues: PropTypes.func.isRequired,
    clearInputValue: PropTypes.func.isRequired,
    setProjectList: PropTypes.func.isRequired,
    setLeadOptions: PropTypes.func.isRequired,
};

const defaultProps = {
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLead extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
        };

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            pristine: false,
        };

        this.formElements = [
            'project',
            'title',
            'source',
            'confidentiality',
            'assignee',
            'publishedOn',
            'url',
            'website',
        ];

        this.validations = {
            project: [requiredCondition],
            title: [requiredCondition],
            source: [requiredCondition],
            confidentiality: [requiredCondition],
            assignee: [requiredCondition],
            publishedOn: [requiredCondition],
            url: [
                requiredCondition,
                urlCondition,
            ],
            website: [requiredCondition],
        };
    }

    componentWillMount() {
        this.projectListRequest = this.createRequestForProjectList();
        this.projectListRequest.start();

        // NOTE: load leadoptions just in case
        this.requestForLeadOptions(this.props.inputValues.project);
    }

    componentWillReceiveProps(nextProps) {
        const { inputValues: oldInputValues } = this.props;
        const { inputValues: newInputValues } = nextProps;

        if (oldInputValues !== newInputValues) {
            if (oldInputValues.project !== newInputValues.project) {
                this.requestForLeadOptions(newInputValues.project);
            }
        }
    }

    componentWillUnmount() {
        if (this.projectListRequest) {
            this.projectListRequest.stop();
        }
        if (this.leadOptionsRequest) {
            this.leadOptionsRequest.stop();
        }
    }

    requestForLeadOptions = (project) => {
        if (this.leadOptionsRequest) {
            this.leadOptionsRequest.stop();
        }
        if (!project || project.length <= 0) {
            this.props.setLeadOptions({ leadOptions: {} });
            return;
        }

        this.leadOptionsRequest = this.createRequestForLeadOptions(project);
        this.leadOptionsRequest.start();
    }

    createRequestForProjectList = () => {
        const projectListUrl = createUrlForProjectList();
        const projectListRequest = new FgRestBuilder()
            .url(projectListUrl)
            .params(() => createParamsForProjectList())
            .success((response) => {
                const { setProjectList } = this.props;

                const params = {
                    projects: response.results,
                };

                setProjectList(params);
            })
            .build();
        return projectListRequest;
    }

    createRequestForLeadOptions = (projectId) => {
        const url = createUrlForLeadOptions(projectId);
        const request = new FgRestBuilder()
            .url(url)
            .params(createParamsForLeadOptions)
            .success((response) => {
                this.props.setLeadOptions({ leadOptions: response });
            })
            .build();
        return request;
    }

    createRequestForLeadCreate = (values) => {
        const maker = val => ({
            ...val,
            sourceType: 'website',
            // NOTE: temporary for now
            project: val.project[0],
        });

        const url = urlForLeadCreate;
        const request = new FgRestBuilder()
            .url(url)
            .params(() => createParamsForLeadCreate(maker(values)))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success(() => {
                const { currentTabId } = this.props;
                this.props.clearInputValue({
                    tabId: currentTabId,
                });
            })
            .build();
        return request;
    }

    handleFormFailure = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formErrors,
            formFieldErrors,
            pristine: true,
        });
    }

    handleSubmitButtonClick = () => {
        if (this.form) {
            this.form.submit();
        }
    }

    handleFormSuccess = (values) => {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }

        this.leadSaveRequest = this.createRequestForLeadCreate(values);
        this.leadSaveRequest.start();
    }

    handleFormChange = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: {
                ...this.state.formFieldErrors,
                ...formFieldErrors,
            },
            formErrors,
            pristine: true,
        });

        const {
            inputValues,
            updateInputValues,
            currentTabId,
        } = this.props;

        const newValues = {
            ...inputValues,
            ...values,
        };

        updateInputValues({
            tabId: currentTabId,
            values: newValues,
        });
    }

    render() {
        const {
            inputValues,
            projects,
            leadOptions: {
                assignee = [],
                confidentiality = [],
            },
        } = this.props;
        const {
            pending,
            formFieldErrors,
        } = this.state;

        return (
            <div styleName="add-lead">
                { pending && <LoadingAnimation /> }
                <header styleName="header">
                    <h1>
                        Add lead
                    </h1>
                    <TransparentButton
                        type="button"
                        disabled={pending}
                    >
                        Settings
                    </TransparentButton>
                </header>
                <Form
                    styleName="inputs"
                    ref={(el) => { this.form = el; }}
                    successCallback={this.handleFormSuccess}
                    changeCallback={this.handleFormChange}
                    failureCallback={this.handleFormFailure}
                    elements={this.formElements}
                    validations={this.validations}
                >
                    <MultiSelectInput
                        formname="project"
                        label="Project"
                        value={inputValues.project}
                        error={formFieldErrors.project}
                        options={projects}
                        keySelector={d => d.id}
                        labelSelector={d => d.title}
                        disabled={pending}
                    />
                    <TextInput
                        formname="title"
                        label="Title"
                        value={inputValues.title}
                        error={formFieldErrors.title}
                        disabled={pending}
                    />
                    <TextInput
                        formname="source"
                        label="Source"
                        value={inputValues.source}
                        error={formFieldErrors.source}
                        disabled={pending}
                    />
                    <SelectInput
                        formname="confidentiality"
                        label="Confidentiality"
                        value={inputValues.confidentiality}
                        error={formFieldErrors.confidentiality}
                        options={confidentiality}
                        keySelector={d => d.key}
                        labelSelector={d => d.value}
                        disabled={pending}
                    />
                    <MultiSelectInput
                        formname="assignee"
                        label="Assigned to"
                        value={inputValues.assignee}
                        error={formFieldErrors.assignee}
                        options={assignee}
                        keySelector={d => d.key}
                        labelSelector={d => d.value}
                        disabled={pending}
                    />
                    <DateInput
                        formname="publishedOn"
                        label="Published on"
                        value={inputValues.publishedOn}
                        error={formFieldErrors.publishedOn}
                        disabled={pending}
                    />
                    <TextInput
                        formname="url"
                        label="Url"
                        value={inputValues.url}
                        error={formFieldErrors.url}
                        disabled={pending}
                    />
                    <TextInput
                        formname="website"
                        label="website"
                        value={inputValues.website}
                        error={formFieldErrors.website}
                        disabled={pending}
                    />
                </Form>
                <div styleName="action-buttons">
                    <PrimaryButton
                        onClick={this.handleSubmitButtonClick}
                        disabled={pending}
                    >
                        Submit
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}
