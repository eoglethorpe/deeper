import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import DateInput from '../vendor/react-store/components/Input/DateInput';
import SelectInput from '../vendor/react-store/components/Input/SelectInput';
import MultiSelectInput from '../vendor/react-store/components/Input/MultiSelectInput';
import TextInput from '../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../vendor/react-store/components/View/LoadingAnimation';
import Form, {
    requiredCondition,
    urlCondition,
} from '../vendor/react-store/components/Input/Form';

import { FgRestBuilder } from '../vendor/react-store/utils/rest';

import AccentButton from '../vendor/react-store/components/Action/Button/AccentButton';
import PrimaryButton from '../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    updateInputValuesAction,
    clearInputValueAction,
    setProjectListAction,
    inputValuesForTabSelector,
    uiStateForTabSelector,
    currentTabIdSelector,
    currentUserIdSelector,
    projectListSelector,
    setLeadOptionsAction,
    leadOptionsSelector,
    serverAddressSelector,
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
    currentUserId: currentUserIdSelector(state),
    serverAddress: serverAddressSelector(state),
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
    currentUserId: PropTypes.number,
    serverAddress: PropTypes.string.isRequired,
};

const defaultProps = {
    currentUserId: undefined,
};

const renderEmpty = () => 'Select a project for available option(s)';

@connect(mapStateToProps, mapDispatchToProps)
export default class AddLead extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingProjectList: false,
            pendingLeadOptions: false,
            pendingWebInfo: false,
            leadSubmittedSuccessfully: undefined,
            submittedLeadId: undefined,
            submittedProjectId: undefined,
        };

        this.schema = {
            fields: {
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
            },
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
            .preLoad(() => {
                this.setState({
                    pendingWebInfo: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    pendingWebInfo: false,
                });
            })
            .success((response) => {
                this.fillWebInfo(response);
            })
            .failure((response) => {
                console.error(response);
            })
            .fatal((response) => {
                console.error(response);
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
            .preLoad(() => {
                this.setState({
                    pendingProjectList: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    pendingProjectList: false,
                });
            })
            .success((response) => {
                const { setProjectList } = this.props;
                const params = {
                    projects: response.results,
                };
                setProjectList(params);
            })
            .failure((response) => {
                console.error(response);
            })
            .fatal((response) => {
                console.error(response);
            })
            .build();
        return projectListRequest;
    }

    createRequestForLeadOptions = (projectId) => {
        const url = createUrlForLeadOptions(projectId);
        const request = new FgRestBuilder()
            .url(url)
            .params(createParamsForLeadOptions)
            .preLoad(() => {
                this.setState({
                    pendingLeadOptions: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    pendingLeadOptions: false,
                });
            })
            .success((response) => {
                this.props.setLeadOptions({ leadOptions: response });
                this.fillExtraInfo();
            })
            .failure((response) => {
                console.error(response);
            })
            .fatal((response) => {
                console.error(response);
            })
            .abort(() => {
                this.setState({
                    pendingLeadOptions: false,
                });
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
                this.setState({ pendingLeadCreate: true });
            })
            .success((response) => {
                let submittedLeadId;
                let submittedProjectId;

                if (response.length === 1) {
                    submittedLeadId = response[0].id;
                    submittedProjectId = response[0].project;
                }

                const { currentTabId } = this.props;
                this.setState({
                    submittedLeadId,
                    submittedProjectId,
                    leadSubmittedSuccessfully: true,
                    pendingLeadCreate: false,
                });
                this.props.clearInputValue({
                    tabId: currentTabId,
                });
            })
            .failure(() => {
                this.setState({
                    submittedLeadId: undefined,
                    submittedProjectId: undefined,
                    leadSubmittedSuccessfully: false,
                    pendingLeadCreate: false,
                });
            })
            .fatal(() => {
                this.setState({
                    submittedLeadId: undefined,
                    submittedProjectId: undefined,
                    leadSubmittedSuccessfully: false,
                    pendingLeadCreate: false,
                });
            })
            .build();
        return request;
    }

    fillExtraInfo = () => {
        const {
            currentTabId,
            inputValues,
            updateInputValues,
            currentUserId,
            leadOptions = {},
        } = this.props;

        const values = {};

        if (!inputValues.assignee || (inputValues.assignee || []).length === 0) {
            values.assignee = [currentUserId];
        }

        if (!inputValues.confidentiality) {
            values.confidentiality = ((leadOptions.confidentiality || [])[0] || {}).key;
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

    handleFormFailure = (formFieldErrors, formErrors) => {
        const {
            currentTabId,
            updateInputValues,
        } = this.props;

        updateInputValues({
            tabId: currentTabId,
            values: {},
            uiState: {
                formErrors,
                formFieldErrors,
                pristine: true,
            },
        });
    }

    handleFormSuccess = (values) => {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }

        this.leadSaveRequest = this.createRequestForLeadCreate(values);
        this.leadSaveRequest.start();
    }

    handleFormChange = (values, formFieldErrors, formErrors) => {
        const uiState = {
            formFieldErrors,
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
            serverAddress,
        } = this.props;
        const { formFieldErrors = emptyObject } = uiState;
        const {
            pendingProjectList,
            pendingLeadOptions,
            pendingWebInfo,
            pendingLeadCreate,
            leadSubmittedSuccessfully,
            submittedLeadId,
            submittedProjectId,
        } = this.state;

        if (leadSubmittedSuccessfully === true) {
            return (
                <div className={styles.submitSuccess}>
                    <p>Lead submitted successfully</p>
                    {
                        submittedLeadId && (
                            <a
                                target="_blank"
                                className={styles.addEntryLink}
                                href={`${serverAddress}/projects/${submittedProjectId}/leads/${submittedLeadId}/edit-entries/`}
                            >
                                Add entry
                            </a>
                        )
                    }
                </div>
            );
        } else if (leadSubmittedSuccessfully === false) {
            return (
                <div className={styles.submitFailure}>
                    An error occured while submitting the lead
                </div>
            );
        }

        const pending = pendingProjectList
            || pendingLeadOptions
            || pendingWebInfo
            || pendingLeadCreate;

        return (
            <div className={styles.addLead}>
                { pending && <LoadingAnimation /> }
                <header
                    className={styles.header}
                    formskip
                >
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
                    className={styles.inputs}
                    successCallback={this.handleFormSuccess}
                    changeCallback={this.handleFormChange}
                    failureCallback={this.handleFormFailure}
                    schema={this.schema}
                    fieldErrors={formFieldErrors}
                    value={inputValues}
                    pending={pending}
                >
                    <MultiSelectInput
                        formname="project"
                        label="Project"
                        options={projects}
                        keySelector={d => d.id}
                        labelSelector={d => d.title}
                    />
                    <TextInput
                        formname="title"
                        label="Title"
                    />
                    <TextInput
                        formname="source"
                        label="Source"
                    />
                    <SelectInput
                        formname="confidentiality"
                        label="Confidentiality"
                        options={confidentiality}
                        keySelector={d => d.key}
                        labelSelector={d => d.value}
                        renderEmpty={renderEmpty}
                    />
                    <MultiSelectInput
                        formname="assignee"
                        label="Assigned to"
                        options={assignee}
                        keySelector={d => (d || {}).key}
                        labelSelector={d => (d || {}).value}
                        renderEmpty={renderEmpty}
                    />
                    <DateInput
                        formname="publishedOn"
                        label="Published on"
                    />
                    <TextInput
                        formname="url"
                        label="Url"
                    />
                    <TextInput
                        formname="website"
                        label="website"
                    />
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            type="submit"
                            disabled={pending}
                        >
                            Submit
                        </PrimaryButton>
                    </div>
                </Form>
            </div>
        );
    }
}
