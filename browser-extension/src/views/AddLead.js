import CSSModules from 'react-css-modules';
import React from 'react';
import { connect } from 'react-redux';
import {
    DateInput,
    SelectInput,
    TextInput,
} from '../public-components/Input';

import { FgRestBuilder } from '../public/utils/rest';

import {
    TransparentButton,
    PrimaryButton,
} from '../public-components/Action';

import {
    updateInputValueAction,
    setProjectListAction,
    setCurrentTabInfoAction,
    inputValuesForTabSelector,
    currentTabIdSelector,
    projectListSelector,
} from '../common/redux';

import {
    createUrlForProjectList,
    createParamsForProjectList,
} from '../common/rest';

import styles from '../stylesheets/add-lead.scss';

const mapStateToProps = state => ({
    inputValues: inputValuesForTabSelector(state),
    currentTabId: currentTabIdSelector(state),
    projects: projectListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    updateInputValue: params => dispatch(updateInputValueAction(params)),
    setCurrentTabInfo: params => dispatch(setCurrentTabInfoAction(params)),
    setProjectList: params => dispatch(setProjectListAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLead extends React.PureComponent {
    constructor(prop) {
        super(prop);

        this.state = {
            pending: undefined,
        };

        this.projectListRequest = this.createRequestForProjectList();
    }

    componentWillMount() {
        if (this.projectListRequest) {
            this.projectListRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.projectListRequest) {
            this.projectListRequest.stop();
        }
    }

    createRequestForProjectList = () => {
        const projectListUrl = createUrlForProjectList();
        const projectListRequest = new FgRestBuilder()
            .url(projectListUrl)
            .params(() => createParamsForProjectList())
            .success((response) => {
                const {
                    setProjectList,
                } = this.props;

                const params = {
                    projects: response.results,
                };

                setProjectList(params);
            })
            .build();
        return projectListRequest;
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

    render() {
        const {
            inputValues,
            projects,
        } = this.props;

        return (
            <div styleName="add-lead">
                <header styleName="header">
                    <h1>
                        Add lead
                    </h1>
                    <TransparentButton
                        type="button"
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
                    />
                    <TextInput
                        label="Title"
                        value={inputValues.title}
                        onChange={value => this.handleInputValueChange('title', value)}
                    />
                    <TextInput
                        label="Source"
                        value={inputValues.source}
                        onChange={value => this.handleInputValueChange('source', value)}
                    />
                    <SelectInput
                        label="Confidentiality"
                        value={inputValues.confidentiality}
                        onChange={value => this.handleInputValueChange('confidentiality', value)}
                    />
                    <SelectInput
                        multiple
                        label="Assigned to"
                        value={inputValues.assignedTo}
                        onChange={value => this.handleInputValueChange('assignedTo', value)}
                    />
                    <DateInput
                        label="Published on"
                        value={inputValues.publishedOn}
                        onChange={value => this.handleInputValueChange('publishedOn', value)}
                    />
                    <TextInput
                        label="Url"
                        value={inputValues.url}
                        onChange={value => this.handleInputValueChange('url', value)}
                    />
                    <TextInput
                        label="website"
                        value={inputValues.website}
                        onChange={value => this.handleInputValueChange('website', value)}
                    />
                </div>
                <div styleName="action-buttons">
                    <PrimaryButton>
                        Submit
                    </PrimaryButton>
                </div>
            </div>
        );
    }
}
