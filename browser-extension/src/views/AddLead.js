import CSSModules from 'react-css-modules';
import React from 'react';
import { connect } from 'react-redux';
import {
    DateInput,
    SelectInput,
    TextInput,
} from '../public-components/Input';

import { FgRestBuilder } from '../public/utils/rest';

import { LoadingAnimation } from '../public-components/View';
import {
    TransparentButton,
    PrimaryButton,
} from '../public-components/Action';

import {
    updateInputValueAction,
    clearInputValueAction,
    setProjectListAction,
    setCurrentTabInfoAction,
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
    updateInputValue: params => dispatch(updateInputValueAction(params)),
    clearInputValue: params => dispatch(clearInputValueAction(params)),
    setCurrentTabInfo: params => dispatch(setCurrentTabInfoAction(params)),
    setProjectList: params => dispatch(setProjectListAction(params)),
    setLeadOptions: params => dispatch(setLeadOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLead extends React.PureComponent {
    constructor(prop) {
        super(prop);

        this.state = {
            pending: false,
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

    createRequestForLeadCreate = () => {
        const maker = val => ({
            ...val,
            sourceType: 'website',
            // NOTE: temporary for now
            project: val.project[0],
        });

        const url = urlForLeadCreate;
        const request = new FgRestBuilder()
            .url(url)
            .params(() => createParamsForLeadCreate(maker(this.props.inputValues)))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                const { currentTabId } = this.props;
                this.props.clearInputValue({
                    tabId: currentTabId,
                });
            })
            .build();
        return request;
    }

    handleInputValueChange = (id, value) => {
        const {
            currentTabId,
            updateInputValue,
        } = this.props;

        updateInputValue({
            tabId: currentTabId,
            id,
            value,
        });
    }

    handleSubmit = () => {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }

        this.leadSaveRequest = this.createRequestForLeadCreate();
        this.leadSaveRequest.start();
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
        const { pending } = this.state;

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
                <div styleName="inputs">
                    <SelectInput
                        multiple
                        label="Project"
                        value={inputValues.project}
                        onChange={value => this.handleInputValueChange('project', value)}
                        options={projects}
                        keySelector={d => d.id}
                        labelSelector={d => d.title}
                        disabled={pending}
                    />
                    <TextInput
                        label="Title"
                        value={inputValues.title}
                        onChange={value => this.handleInputValueChange('title', value)}
                        disabled={pending}
                    />
                    <TextInput
                        label="Source"
                        value={inputValues.source}
                        onChange={value => this.handleInputValueChange('source', value)}
                        disabled={pending}
                    />
                    <SelectInput
                        label="Confidentiality"
                        value={inputValues.confidentiality}
                        onChange={value => this.handleInputValueChange('confidentiality', value)}
                        options={confidentiality}
                        keySelector={d => d.key}
                        labelSelector={d => d.value}
                        disabled={pending}
                    />
                    <SelectInput
                        multiple
                        label="Assigned to"
                        value={inputValues.assignedTo}
                        onChange={value => this.handleInputValueChange('assignedTo', value)}
                        options={assignee}
                        keySelector={d => d.key}
                        labelSelector={d => d.value}
                        disabled={pending}
                    />
                    <DateInput
                        label="Published on"
                        value={inputValues.publishedOn}
                        onChange={value => this.handleInputValueChange('publishedOn', value)}
                        disabled={pending}
                    />
                    <TextInput
                        label="Url"
                        value={inputValues.url}
                        onChange={value => this.handleInputValueChange('url', value)}
                        disabled={pending}
                    />
                    <TextInput
                        label="website"
                        value={inputValues.website}
                        onChange={value => this.handleInputValueChange('website', value)}
                        disabled={pending}
                    />
                </div>
                <div styleName="action-buttons">
                    <PrimaryButton
                        onClick={this.handleSubmit}
                        disabled={pending}
                    >
                        Submit
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}
