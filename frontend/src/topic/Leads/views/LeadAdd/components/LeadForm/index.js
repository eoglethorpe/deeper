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
} from '../../../../../../public/components/Input';
import { LoadingAnimation } from '../../../../../../public/components/View';

import ApplyAll from '../ApplyAll';

import { LEAD_TYPE, ATTACHMENT_TYPES } from '../../utils/constants';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,

    lead: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    leadOptions: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    onSuccess: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,

    isFormDisabled: PropTypes.bool.isRequired,
    isBulkActionDisabled: PropTypes.bool.isRequired,
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class LeadForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { lead } = props;

        const commonElements = [
            'project',
            'title',
            'source',
            'confidentiality',
            'assignee',
            'publishedOn',
            'sourceType',
        ];

        const commonValidations = {
            title: [requiredCondition],
            source: [requiredCondition],
            confidentiality: [requiredCondition],
            assignee: [requiredCondition],
            publishedOn: [requiredCondition],
            sourceType: [requiredCondition],
        };

        switch (lead.data.type) {
            case LEAD_TYPE.file:
            case LEAD_TYPE.dropbox:
            case LEAD_TYPE.drive:
                this.elements = [
                    ...commonElements,
                    'attachment',
                ];
                this.validations = {
                    ...commonValidations,
                    attachment: [requiredCondition],
                };
                break;
            case LEAD_TYPE.website:
                this.elements = [
                    ...commonElements,
                    'website',
                    'url',
                ];
                this.validations = {
                    ...commonValidations,
                    url: [
                        requiredCondition,
                        urlCondition,
                    ],
                    website: [requiredCondition],
                };
                break;
            case LEAD_TYPE.text:
                this.elements = [
                    ...commonElements,
                    'text',
                ];
                this.validations = {
                    ...commonValidations,
                    text: [requiredCondition],
                };
                break;
            default:
                console.warn(`Unknown lead type ${lead.type}`);
                this.elements = commonElements;
                this.validations = commonValidations;
        }
    }

    submit = () => {
        if (this.formRef) {
            this.formRef.submit();
        }
    }

    handleApplyAllClick = name => this.props.onApplyAllClick(name);
    handleApplyAllBelowClick= name => this.props.onApplyAllBelowClick(name);

    render() {
        const {
            className,
            lead,

            leadOptions,
            onChange,
            onFailure,
            onSuccess,
            isFormDisabled,
            isBulkActionDisabled,
        } = this.props;

        const {
            values,
            errors,
            fieldErrors,
        } = lead.form;
        const {
            type,
        } = lead.data;

        return (
            <Form
                ref={(ref) => { this.formRef = ref; }}
                changeCallback={onChange}
                className={className}
                elements={this.elements}
                failureCallback={onFailure}
                styleName="add-lead-form"
                successCallback={onSuccess}
                validations={this.validations}
            >
                {
                    isFormDisabled && <LoadingAnimation />
                }
                <header
                    styleName="header"
                >
                    <NonFieldErrors errors={errors} />
                </header>
                <HiddenInput
                    formname="sourceType"
                    value={type}
                />
                <SelectInput
                    disabled
                    error={fieldErrors.project}
                    formname="project"
                    keySelector={d => (d || {}).key}
                    label="Project"
                    labelSelector={d => (d || {}).value}
                    options={leadOptions.project}
                    placeholder="Project Deep"
                    showHintAndError
                    showLabel
                    styleName="project"
                    value={values.project}
                />
                <div
                    styleName="line-break"
                />

                <TextInput
                    styleName="title"
                    error={fieldErrors.title}
                    formname="title"
                    label="Title"
                    placeholder="Lead 12:21:00 PM"
                    value={values.title}
                />

                <ApplyAll
                    styleName="source"
                    disabled={isFormDisabled || isBulkActionDisabled}
                    identiferName="source"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <TextInput
                        error={fieldErrors.source}
                        formname="source"
                        label="Source"
                        placeholder="Newspaper"
                        value={values.source}
                    />
                </ApplyAll>

                <SelectInput
                    error={fieldErrors.confidentiality}
                    formname="confidentiality"
                    keySelector={d => (d || {}).key}
                    label="Confidentiality"
                    labelSelector={d => (d || {}).value}
                    options={leadOptions.confidentiality}
                    placeholder="Select one"
                    showHintAndError
                    showLabel
                    styleName="confidentiality"
                    value={values.confidentiality}
                />
                <SelectInput
                    error={fieldErrors.assignee}
                    multiple
                    formname="assignee"
                    keySelector={d => (d || {}).key}
                    labelSelector={d => (d || {}).value}
                    label="Assign To"
                    options={leadOptions.assignee}
                    placeholder="Select one"
                    showHintAndError
                    showLabel
                    styleName="user"
                    value={values.assignee}
                />
                <ApplyAll
                    styleName="date"
                    disabled={isFormDisabled || isBulkActionDisabled}
                    identiferName="publishedOn"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <DateInput
                        error={fieldErrors.publishedOn}
                        formname="publishedOn"
                        label="Published on"
                        placeholder="12/12/2012"
                        value={values.publishedOn}
                    />
                </ApplyAll>
                {
                    lead.data.type === LEAD_TYPE.website && [
                        <TextInput
                            error={fieldErrors.url}
                            formname="url"
                            key="url"
                            label="URL"
                            placeholder="https://deeper.togglecorp.com"
                            styleName="url"
                            value={values.url}
                        />,
                        <TextInput
                            error={fieldErrors.website}
                            formname="website"
                            key="website"
                            label="Website"
                            placeholder="togglecorp.com"
                            styleName="website"
                            value={values.website}
                        />,
                    ]
                }
                {
                    lead.data.type === LEAD_TYPE.text &&
                        <TextArea
                            error={fieldErrors.text}
                            formname="text"
                            label="Text"
                            placeholder="Enter text description here"
                            rows="3"
                            styleName="text"
                            value={values.text}
                        />
                }
                {
                    // one of drive, dropbox, or file
                    ATTACHMENT_TYPES.indexOf(lead.data.type) !== -1 && ([
                        <p
                            key="title"
                            styleName="file-title"
                        >
                            Gallery File: {values.attachment}
                        </p>,
                        <HiddenInput
                            formname="attachment"
                            key="input"
                            value={values.attachment}
                        />,
                    ])
                }
            </Form>
        );
    }
}
