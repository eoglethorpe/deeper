import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DateInput,
    Form,
    HiddenInput,
    NonFieldErrors,
    SelectInput,
    TextArea,
    TextInput,
    requiredCondition,
    urlCondition,
} from '../../../../public/components/Input';

import {
    LoadingAnimation,
} from '../../../../public/components/View';

import {
    Button,
    SuccessButton,
} from '../../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    formCallbacks: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    lead: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    leadOptions: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    className: '',
    uploadData: {},
};

@CSSModules(styles, { allowMultiple: true })
export default class AddLeadForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.elements = [
            'project',
            'title',
            'source',
            'confidentiality',
            'user',
            'date',
            'url',
            'website',
            'server_id',
            'text',
        ];

        this.validations = {
            title: [requiredCondition],
            source: [requiredCondition],
            confidentiality: [requiredCondition],
            user: [requiredCondition],
            date: [requiredCondition],
            url: [
                requiredCondition,
                urlCondition,
            ],
            website: [requiredCondition],
            // TODO: add validation for server_id
        };
    }

    onPrev = (e) => {
        e.preventDefault();
        this.props.formCallbacks.onPrev();
    }

    onNext = (e) => {
        e.preventDefault();
        this.props.formCallbacks.onNext();
    }

    render() {
        const {
            className,
            formCallbacks,
            lead,
            leadOptions,
        } = this.props;

        const {
            onChange,
            onFailure,
            onSuccess,
        } = formCallbacks;

        const {
            pending,
            stale,
            ready,
        } = lead.uiState;

        const {
            values,
            errors,
            fieldErrors,
        } = lead.form;

        const {
            onPrev,
            onNext,
        } = this;

        return (
            <Form
                changeCallback={onChange}
                className={className}
                elements={this.elements}
                failureCallback={onFailure}
                styleName="add-lead-form"
                successCallback={onSuccess}
                validations={this.validations}
            >
                {
                    pending && <LoadingAnimation />
                }
                <header
                    styleName="header"
                >
                    <NonFieldErrors errors={errors} />
                    <div styleName="action-buttons">
                        <Button
                            onClick={onPrev}
                        >
                            Prev
                        </Button>
                        <Button
                            onClick={onNext}
                        >
                            Next
                        </Button>
                        <SuccessButton
                            disabled={pending || !stale || !ready}
                        >
                            Save
                        </SuccessButton>
                    </div>
                </header>
                <SelectInput
                    error={fieldErrors.project}
                    formname="project"
                    keySelector={d => (d || {}).key}
                    label="Project"
                    labelSelector={d => (d || {}).value}
                    options={leadOptions.project}
                    placeholder="Select a project"
                    showHintAndError
                    showLabel
                    styleName="project"
                    value={values.project}
                />
                <div
                    styleName="line-break"
                />
                <TextInput
                    error={fieldErrors.title}
                    formname="title"
                    label="Title"
                    placeholder="Title of lead"
                    styleName="title"
                    value={values.title}
                />
                <TextInput
                    error={fieldErrors.source}
                    formname="source"
                    label="Source"
                    placeholder="Source of lead (eg: Press)"
                    styleName="source"
                    value={values.source}
                />
                <SelectInput
                    error={fieldErrors.confidentiality}
                    formname="confidentiality"
                    keySelector={d => (d || {}).key}
                    label="Confidentiality"
                    labelSelector={d => (d || {}).value}
                    options={leadOptions.confidentiality}
                    placeholder="Select a confidentiality"
                    showHintAndError
                    showLabel
                    styleName="confidentiality"
                    value={values.confidentiality}
                />
                <SelectInput
                    error={fieldErrors.user}
                    formname="user"
                    keySelector={d => (d || {}).key}
                    label="Assign To"
                    labelSelector={d => (d || {}).value}
                    options={leadOptions.assignee}
                    placeholder="Select a user"
                    showHintAndError
                    showLabel
                    styleName="user"
                    value={values.user}
                />
                <DateInput
                    error={fieldErrors.date}
                    formname="date"
                    label="Publication Date"
                    placeholder="Enter a descriptive name"
                    styleName="date"
                    value={values.date}
                />
                {
                    lead.data.type === 'website' && [
                        <TextInput
                            error={fieldErrors.url}
                            formname="url"
                            key="url"
                            label="URL"
                            placeholder="Enter a descriptive name"
                            styleName="url"
                            value={values.url}
                        />,
                        <TextInput
                            error={fieldErrors.website}
                            formname="website"
                            key="website"
                            label="Website"
                            placeholder="Enter a descriptive name"
                            styleName="website"
                            value={values.website}
                        />,
                    ]
                }
                {
                    lead.data.type === 'text' &&
                        <TextArea
                            formname="text"
                            label="Text"
                            placeholder="Enter text"
                            rows="3"
                            styleName="text"
                            value={values.text}
                        />
                }
                {
                    lead.data.type === 'file' && ([
                        <p
                            key="title"
                            styleName="file-title"
                        >
                            {/*
                                lead.upload.error ? (
                                    lead.upload.error
                                ) : (
                                    lead.upload.title
                                )
                            */}
                        </p>,
                        <HiddenInput
                            formname="server_id"
                            key="input"
                            value={values.server_id}
                        />,
                    ])
                }
            </Form>
        );
    }
}
