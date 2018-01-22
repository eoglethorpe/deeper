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
    AccentButton,
    PrimaryButton,
} from '../public-components/Action';

import {
    updateInputValuesAction,
    clearInputValueAction,
    setProjectListAction,
    inputValuesForTabSelector,
    uiStateForTabSelector,
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

    createUrlForLeadCreate,
    createParamsForLeadCreate,

    createUrlForWebInfo,
    createParamsForWebInfo,
} from '../common/rest';

import styles from '../stylesheets/add-lead.scss';

const emptyObject = {};

const mapStateToProps = state => ({
    uiState: uiStateForTabSelector(state),
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
    uiState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    inputValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    currentTabId: PropTypes.string.isRequired,
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    leadOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
    updateInputValues: PropTypes.func.isRequired,
    clearInputValue: PropTypes.func.isRequired,
    setProjectList: PropTypes.func.isRequired,
    setLeadOptions: PropTypes.func.isRequired,
    onSettingsButtonClick: PropTypes.func.isRequired,
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
            leadSubmittedSuccessfully: undefined,
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
        this.requestForWebInfo(this.props.currentTabId);
    }

    componentWillReceiveProps(nextProps) {
        const { inputValues: oldInputValues } = this.props;
        const { inputValues: newInputValues } = nextProps;

        if (oldInputValues !== newInputValues) {
            if (oldInputValues.project !== newInputValues.project) {
                this.requestForLeadOptions(newInputValues.project);
            }
        }

        if (this.props.currentTabId !== nextProps.currentTabId) {
            this.requestForWebInfo(nextProps.currentTabId);
        }
    }

    componentWillUnmount() {
        if (this.projectListRequest) {
            this.projectListRequest.stop();
        }
        if (this.leadOptionsRequest) {
            this.leadOptionsRequest.stop();
        }
        if (this.webInfoRequest) {
            this.webInfoRequest.stop();
        }
    }

    requestForWebInfo = (url) => {
        if (this.webInfoRequest) {
            this.webInfoRequest.stop();
        }
        if (url && url.length > 0) {
            this.webInfoRequest = this.createRequestForWebInfo(url);
            this.webInfoRequest.start();
        }
    }

    createRequestForWebInfo = (url) => {
        const webInfoRequest = new FgRestBuilder()
            .url(createUrlForWebInfo())
            .params(() => createParamsForWebInfo({ url }))
            .success((response) => {
                this.fillWebInfo(response);
            })
            .build();
        return webInfoRequest;
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
            project: val.project,
        });

        const url = createUrlForLeadCreate();
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
                this.setState({ leadSubmittedSuccessfully: true });
                this.props.clearInputValue({
                    tabId: currentTabId,
                });
            })
            .failure(() => {
                this.setState({ leadSubmittedSuccessfully: false });
            })
            .fatal(() => {
                this.setState({ leadSubmittedSuccessfully: false });
            })
            .build();
        return request;
    }

    fillWebInfo = (webInfo) => {
        const {
            currentTabId,
            inputValues,
            updateInputValues,
        } = this.props;

        const values = {};
        if (webInfo.project && (!inputValues.project || inputValues.project.length === 0)) {
            values.project = [webInfo.project];
        }
        if (webInfo.date && !inputValues.date) {
            values.publishedOn = webInfo.date;
        }
        if (webInfo.source && !inputValues.source) {
            values.source = webInfo.source;
        }
        if (webInfo.website && !inputValues.website) {
            values.website = webInfo.website;
        }
        if (webInfo.title && !inputValues.title) {
            values.title = webInfo.title;
        }
        if (webInfo.url && !inputValues.url) {
            values.url = webInfo.url;
        }

        const newValues = {
            ...inputValues,
            ...values,
        };

        updateInputValues({
            tabId: currentTabId,
            values: newValues,
        });
    }

    handleFormFailure = ({ formErrors, formFieldErrors }) => {
        const {
            currentTabId,
            updateInputValues,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            values: {},
            uiState: {
                formErrors,
                formFieldErrors: {
                    ...this.props.uiState.formFieldErrors,
                    ...formFieldErrors,
                },
                pristine: true,
            },
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
        const uiState = {
            formFieldErrors: {
                ...this.props.uiState.formFieldErrors,
                ...formFieldErrors,
            },
            formErrors,
            pristine: true,
        };

        const {
            updateInputValues,
            currentTabId,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            uiState,
            values,
        });
    }

    render() {
        const {
            inputValues,
            uiState,
            projects,
            leadOptions: {
                assignee = [],
                confidentiality = [],
            },
            onSettingsButtonClick,
        } = this.props;
        const { formFieldErrors = emptyObject } = uiState;
        const {
            pending,
            leadSubmittedSuccessfully,

        } = this.state;

        if (leadSubmittedSuccessfully === true) {
            return (
                <div styleName="submit-success">
                    Lead submitted successfully
                </div>
            );
        } else if (leadSubmittedSuccessfully === false) {
            return (
                <div styleName="submit-failure">
                    An error occured while submitting the lead
                </div>
            );
        }

        return (
            <div styleName="add-lead">
                { pending && <LoadingAnimation /> }
                <header styleName="header">
                    <h1>
                        Add lead
                    </h1>
                    <AccentButton
                        transparent
                        type="button"
                        disabled={pending}
                        onClick={onSettingsButtonClick}
                    >
                        Settings
                    </AccentButton>
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
