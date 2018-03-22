import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Form, {
    requiredCondition,
    urlCondition,
} from '../../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import MultiSelectInput from '../../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import TextArea from '../../../../vendor/react-store/components/Input/TextArea';
import HiddenInput from '../../../../vendor/react-store/components/Input/HiddenInput';
import DateInput from '../../../../vendor/react-store/components/Input/DateInput';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import FormattedDate from '../../../../vendor/react-store/components/View/FormattedDate';

import {
    LEAD_TYPE,
    ATTACHMENT_TYPES,
    leadAccessor,
} from '../../../../entities/lead';
import { InternalGallery } from '../../../../components/DeepGallery';
import {
    leadsStringsSelector,
    activeUserSelector,
} from '../../../../redux';

import ApplyAll, { ExtractThis } from './ApplyAll';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,

    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

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
    activeUser: activeUserSelector(state),
});

@connect(mapStateToProps, null, null, { withRef: true })
export default class LeadForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = d => (d || {}).key
    static labelSelector = d => (d || {}).value

    static setDefaultValues = (props) => {
        const { leadOptions, lead, activeUser } = props;
        const values = leadAccessor.getValues(lead);
        const activeUserId = activeUser.userId;

        const newValues = { ...values };
        let valuesChanged = false;

        if (
            !values.confidentiality &&
            leadOptions && leadOptions.confidentiality && leadOptions.confidentiality.length > 0
        ) {
            newValues.confidentiality = LeadForm.keySelector(leadOptions.confidentiality[0]);
            valuesChanged = true;
        }

        if (
            (!values.assignee || values.assignee.length === 0) &&
            leadOptions && leadOptions.assignee && leadOptions.assignee.length > 0 &&
            leadOptions.assignee.find(user => LeadForm.keySelector(user) === activeUserId)
        ) {
            newValues.assignee = [activeUserId];
            valuesChanged = true;
        }

        // FIXME: don't use this, use utils by dahal
        if (!values.publishedOn) {
            const now = new Date();
            newValues.publishedOn = FormattedDate.format(now, 'yyyy-MM-dd');
            valuesChanged = true;
        }

        if (valuesChanged) {
            props.onChange(newValues);
        }
    }

    static getSchemaForLead = (type) => {
        switch (type) {
            case LEAD_TYPE.file:
            case LEAD_TYPE.dropbox:
            case LEAD_TYPE.drive:
                return {
                    fields: {
                        title: [requiredCondition],
                        source: [requiredCondition],
                        confidentiality: [requiredCondition],
                        assignee: [requiredCondition],
                        publishedOn: [requiredCondition],
                        sourceType: [requiredCondition],
                        project: [requiredCondition],

                        attachment: [requiredCondition],
                    },
                };
            case LEAD_TYPE.website:
                return {
                    fields: {
                        title: [requiredCondition],
                        source: [requiredCondition],
                        confidentiality: [requiredCondition],
                        assignee: [requiredCondition],
                        publishedOn: [requiredCondition],
                        sourceType: [requiredCondition],
                        project: [requiredCondition],

                        url: [requiredCondition, urlCondition],
                        website: [requiredCondition],
                    },
                };
            case LEAD_TYPE.text:
                return {
                    fields: {
                        title: [requiredCondition],
                        source: [requiredCondition],
                        confidentiality: [requiredCondition],
                        assignee: [requiredCondition],
                        publishedOn: [requiredCondition],
                        sourceType: [requiredCondition],
                        project: [requiredCondition],

                        text: [requiredCondition],
                    },
                };
            default:
                return {
                    fields: {},
                };
        }
    }

    constructor(props) {
        super(props);

        const { lead } = props;
        const leadType = leadAccessor.getType(lead);
        this.schema = LeadForm.getSchemaForLead(leadType);
    }

    componentWillMount() {
        LeadForm.setDefaultValues(this.props);
    }

    componentWillReceiveProps(nextProps) {
        const { leadOptions: oldLeadOptions } = this.props;
        if (nextProps.leadOptions !== oldLeadOptions) {
            LeadForm.setDefaultValues(nextProps);
        }
    }

    handleApplyAllClick = name => this.props.onApplyAllClick(name);

    handleApplyAllBelowClick= name => this.props.onApplyAllBelowClick(name);

    submit = () => {
        if (this.formRef && !this.props.isSaveDisabled) {
            this.formRef.submit();
            return true;
        }
        return false;
    }

    render() {
        const {
            className,
            lead,

            leadOptions = {},
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
                className={`${styles.addLeadForm} ${className}`}
                schema={this.schema}
                changeCallback={onChange}
                failureCallback={onFailure}
                successCallback={onSuccess}
                formErrors={errors}
                fieldErrors={fieldErrors}
                value={values}
                disabled={isFormDisabled}
            >
                {
                    (isFormLoading || isExtractionLoading) && <LoadingAnimation />
                }
                <header className={styles.header}>
                    <NonFieldErrors formerror="" />
                </header>
                <HiddenInput formname="sourceType" />
                {
                    type === LEAD_TYPE.website && [
                        <ExtractThis
                            key="url"
                            className={styles.url}
                            disabled={isFormDisabled || isExtractionDisabled}
                            onClick={onExtractClick}
                        >
                            <TextInput
                                formname="url"
                                label={this.props.leadsStrings('urlLabel')}
                                placeholder={this.props.leadsStrings('urlPlaceholderLabel')}
                                autoFocus
                            />
                        </ExtractThis>,
                        <TextInput
                            formname="website"
                            key="website"
                            label={this.props.leadsStrings('websiteLabel')}
                            placeholder={this.props.leadsStrings('urlPlaceholderLabel')}
                            className={styles.website}
                        />,
                    ]
                }
                {
                    type === LEAD_TYPE.text &&
                        <TextArea
                            formname="text"
                            label={this.props.leadsStrings('textLabel')}
                            placeholder={this.props.leadsStrings('textareaPlaceholderLabel')}
                            rows="3"
                            className={styles.text}
                            autoFocus
                        />
                }
                {/* TODO: change from disabled to readonly */}
                <SelectInput
                    disabled
                    formoverrides={['disabled']}
                    formname="project"
                    keySelector={LeadForm.keySelector}
                    label={this.props.leadsStrings('projectLabel')}
                    labelSelector={LeadForm.labelSelector}
                    options={leadOptions.project}
                    placeholder={this.props.leadsStrings('projectPlaceholderLabel')}
                    showHintAndError
                    showLabel
                    className={styles.project}
                />
                <div
                    className={styles.lineBreak}
                />
                <TextInput
                    className={styles.title}
                    formname="title"
                    label={this.props.leadsStrings('titleLabel')}
                    placeholder={this.props.leadsStrings('titlePlaceHolderLabel')}
                />

                <ApplyAll
                    className={styles.source}
                    disabled={isApplyAllDisabled}
                    identiferName="source"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <TextInput
                        formname="source"
                        label={this.props.leadsStrings('publisherLabel')}
                        placeholder={this.props.leadsStrings('publisherPlaceHolderLabel')}
                    />
                </ApplyAll>
                <ApplyAll
                    className={styles.confidentiality}
                    disabled={isApplyAllDisabled}
                    identiferName="confidentiality"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <SelectInput
                        formname="confidentiality"
                        keySelector={LeadForm.keySelector}
                        label={this.props.leadsStrings('confidentialityLabel')}
                        labelSelector={LeadForm.labelSelector}
                        options={leadOptions.confidentiality}
                        placeholder={this.props.leadsStrings('selectInputPlaceholderLabel')}
                        showHintAndError
                        showLabel
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.user}
                    disabled={isApplyAllDisabled}
                    identiferName="assignee"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <MultiSelectInput
                        formname="assignee"
                        keySelector={LeadForm.keySelector}
                        label={this.props.leadsStrings('assigneeLabel')}
                        labelSelector={LeadForm.labelSelector}
                        options={leadOptions.assignee}
                        placeholder={this.props.leadsStrings('selectInputPlaceholderLabel')}
                        showHintAndError
                        showLabel
                    />
                </ApplyAll>

                <ApplyAll
                    className={styles.date}
                    disabled={isApplyAllDisabled}
                    identiferName="publishedOn"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <DateInput
                        formname="publishedOn"
                        label={this.props.leadsStrings('datePublishedLabel')}
                        placeholder={this.props.leadsStrings('datePublishedPlaceholderLabel')}
                    />
                </ApplyAll>
                {
                    // one of drive, dropbox, or file
                    ATTACHMENT_TYPES.indexOf(type) !== -1 && ([
                        <div
                            key="title"
                            className={styles.fileTitle}
                        >
                            {
                                values.attachment && (
                                    <InternalGallery
                                        onlyFileName
                                        galleryId={values.attachment.id}
                                    />
                                )
                            }
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
