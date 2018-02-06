import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    DateInput,
    Form,
    HiddenInput,
    NonFieldErrors,
    SelectInput,
    MultiSelectInput,
    TextArea,
    TextInput,
    requiredCondition,
    urlCondition,
} from '../../../../../../public/components/Input';
import { LoadingAnimation } from '../../../../../../public/components/View';

import {
    LEAD_TYPE,
    ATTACHMENT_TYPES,
    leadAccessor,
} from '../../../../../../common/entities/lead';
import DeepGallery from '../../../../../../common/components/DeepGallery';
import { leadsStringsSelector } from '../../../../../../common/redux';

import ApplyAll, { ExtractThis } from '../ApplyAll';
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
    onApplyAllClick: PropTypes.func.isRequired,
    onApplyAllBelowClick: PropTypes.func.isRequired,

    isSaveDisabled: PropTypes.bool.isRequired,
    isFormDisabled: PropTypes.bool.isRequired,
    isFormLoading: PropTypes.bool.isRequired,
    isBulkActionDisabled: PropTypes.bool.isRequired,

    isExtractionDisabled: PropTypes.bool.isRequired,
    isExtractionLoading: PropTypes.bool.isRequired,
    onExtractClick: PropTypes.func.isRequired,

    leadsStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    leadsStrings: leadsStringsSelector(state),
});

@connect(mapStateToProps, null, null, { withRef: true })
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

        const leadType = leadAccessor.getType(lead);
        switch (leadType) {
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
                console.warn(`Unknown lead type ${leadType}`);
                this.elements = commonElements;
                this.validations = commonValidations;
        }
    }

    submit = () => {
        if (this.formRef && !this.props.isSaveDisabled) {
            this.formRef.submit();
            return true;
        }
        return false;
    }

    handleApplyAllClick = name => this.props.onApplyAllClick(name);

    handleApplyAllBelowClick= name => this.props.onApplyAllBelowClick(name);

    keySelector = d => (d || {}).key

    labelSelector = d => (d || {}).value

    render() {
        const {
            className,
            lead,

            leadOptions,
            onChange,
            onFailure,
            onSuccess,
            isFormDisabled,
            isFormLoading,
            isBulkActionDisabled,

            isExtractionDisabled,
            isExtractionLoading,
            onExtractClick,
        } = this.props;

        const values = leadAccessor.getValues(lead);
        const type = leadAccessor.getType(lead);
        const errors = leadAccessor.getErrors(lead);
        const fieldErrors = leadAccessor.getFieldErrors(lead);

        const isApplyAllDisabled = isFormDisabled || isBulkActionDisabled;

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
                    (isFormLoading || isExtractionLoading) && <LoadingAnimation />
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
                {
                    type === LEAD_TYPE.website && [
                        <ExtractThis
                            key="url"
                            styleName="url"
                            disabled={isFormDisabled || isExtractionDisabled}
                            onClick={onExtractClick}
                        >
                            <TextInput
                                error={fieldErrors.url}
                                formname="url"
                                label={this.props.leadsStrings('urlLabel')}
                                placeholder={this.props.leadsStrings('urlPlaceholderLabel')}
                                value={values.url}
                                disabled={isFormDisabled}
                                autoFocus
                            />
                        </ExtractThis>,
                        <TextInput
                            error={fieldErrors.website}
                            formname="website"
                            key="website"
                            label={this.props.leadsStrings('websiteLabel')}
                            placeholder={this.props.leadsStrings('urlPlaceholderLabel')}
                            styleName="website"
                            value={values.website}
                            disabled={isFormDisabled}
                        />,
                    ]
                }
                {
                    type === LEAD_TYPE.text &&
                        <TextArea
                            error={fieldErrors.text}
                            formname="text"
                            label={this.props.leadsStrings('textLabel')}
                            placeholder={this.props.leadsStrings('textareaPlaceholderLabel')}
                            rows="3"
                            styleName="text"
                            value={values.text}
                            disabled={isFormDisabled}
                            autoFocus
                        />
                }
                <SelectInput
                    disabled
                    error={fieldErrors.project}
                    formname="project"
                    keySelector={this.keySelector}
                    label={this.props.leadsStrings('projectLabel')}
                    labelSelector={this.labelSelector}
                    options={leadOptions.project}
                    placeholder={this.props.leadsStrings('projectPlaceholderLabel')}
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
                    label={this.props.leadsStrings('titleLabel')}
                    placeholder={this.props.leadsStrings('titlePlaceHolderLabel')}
                    value={values.title}
                    disabled={isFormDisabled}
                />

                <ApplyAll
                    styleName="source"
                    disabled={isApplyAllDisabled}
                    identiferName="source"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <TextInput
                        error={fieldErrors.source}
                        formname="source"
                        label={this.props.leadsStrings('publisherLabel')}
                        placeholder={this.props.leadsStrings('publisherPlaceHolderLabel')}
                        value={values.source}
                        disabled={isFormDisabled}
                    />
                </ApplyAll>
                <ApplyAll
                    styleName="confidentiality"
                    disabled={isApplyAllDisabled}
                    identiferName="confidentiality"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <SelectInput
                        error={fieldErrors.confidentiality}
                        formname="confidentiality"
                        keySelector={this.keySelector}
                        label={this.props.leadsStrings('confidentialityLabel')}
                        labelSelector={this.labelSelector}
                        options={leadOptions.confidentiality}
                        placeholder={this.props.leadsStrings('selectInputPlaceholderLabel')}
                        showHintAndError
                        showLabel
                        value={values.confidentiality}
                        disabled={isFormDisabled}
                    />
                </ApplyAll>

                <ApplyAll
                    styleName="user"
                    disabled={isApplyAllDisabled}
                    identiferName="assignee"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <MultiSelectInput
                        error={fieldErrors.assignee}
                        formname="assignee"
                        keySelector={this.keySelector}
                        label={this.props.leadsStrings('assigneeLabel')}
                        labelSelector={this.labelSelector}
                        options={leadOptions.assignee}
                        placeholder={this.props.leadsStrings('selectInputPlaceholderLabel')}
                        showHintAndError
                        showLabel
                        value={values.assignee}
                        disabled={isFormDisabled}
                    />
                </ApplyAll>

                <ApplyAll
                    styleName="date"
                    disabled={isApplyAllDisabled}
                    identiferName="publishedOn"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <DateInput
                        error={fieldErrors.publishedOn}
                        formname="publishedOn"
                        label={this.props.leadsStrings('datePublishedLabel')}
                        placeholder={this.props.leadsStrings('datePublishedPlaceholderLabel')}
                        value={values.publishedOn}
                        disabled={isFormDisabled}
                    />
                </ApplyAll>
                {
                    // one of drive, dropbox, or file
                    ATTACHMENT_TYPES.indexOf(type) !== -1 && ([
                        <div
                            key="title"
                            styleName="file-title"
                        >
                            <DeepGallery
                                onlyFileName
                                galleryId={values.attachment && values.attachment.id}
                            />
                        </div>,
                        <HiddenInput
                            formname="attachment"
                            key="input"
                            value={values.attachment || ''}
                        />,
                    ])
                }
            </Form>
        );
    }
}
