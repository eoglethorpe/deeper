import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
// import { connect } from 'react-redux';

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
/*
import {
    PrimaryButton,
    DangerButton,
    SuccessButton,
} from '../../../../../../public/components/Action';
*/
import { LoadingAnimation } from '../../../../../../public/components/View';


import styles from './styles.scss';

const ATTACHMENT_TYPES = ['file', 'dropbox', 'drive'];

/*
const mapStateToProps = state => ({
});
*/

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
};

const defaultProps = {
    className: '',
};

// @connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeadForm extends React.PureComponent {
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
            'attachment',
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
            text: [requiredCondition],
            attachment: [requiredCondition],
            // TODO: add validation for attachment
        };
    }

    submit = () => {
        const { lead } = this.props;
        const { pending, stale, ready } = lead.uiState;
        if (pending || !stale || !ready) {
            return;
        }
        if (this.formRef) {
            this.formRef.submit();
        }
    }

    render() {
        const {
            className,
            lead,

            leadOptions,
            onChange,
            onFailure,
            onSuccess,
        } = this.props;

        const { pending } = lead.uiState;

        const {
            values,
            errors,
            fieldErrors,
        } = lead.form;

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
                    pending && <LoadingAnimation />
                }
                <header
                    styleName="header"
                >
                    <NonFieldErrors errors={errors} />
                    {/*
                    <div styleName="action-buttons">
                        <SuccessButton disabled={pending || !stale || !ready} >
                            Save
                        </SuccessButton>
                    </div>
                    */}
                </header>
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
                    error={fieldErrors.title}
                    formname="title"
                    label="Title"
                    placeholder="Lead 12:21:00 PM"
                    styleName="title"
                    value={values.title}
                />
                <TextInput
                    error={fieldErrors.source}
                    formname="source"
                    label="Source"
                    placeholder="Newspaper"
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
                    placeholder="Select one"
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
                    placeholder="Select one"
                    showHintAndError
                    showLabel
                    styleName="user"
                    value={values.user}
                />
                <DateInput
                    error={fieldErrors.date}
                    formname="date"
                    label="Publication Date"
                    placeholder="12/12/2012"
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
                    lead.data.type === 'text' &&
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
                    ATTACHMENT_TYPES.indexOf(lead.data.type) !== -1 && ([
                        <p
                            key="title"
                            styleName="file-title"
                        >
                            {
                                lead.upload.errorMessage ? (
                                    lead.upload.errorMessage
                                ) : (
                                    <a
                                        href={lead.upload.url}
                                        target="_blank"
                                    >
                                        {lead.upload.title}
                                    </a>
                                )
                            }
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
