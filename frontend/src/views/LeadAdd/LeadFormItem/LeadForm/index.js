import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, {
    requiredCondition,
    urlCondition,
} from '../../../../vendor/react-store/components/Input/Faram';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import SelectInput from '../../../../vendor/react-store/components/Input/SelectInput';
import MultiSelectInput from '../../../../vendor/react-store/components/Input/MultiSelectInput';
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
import { activeUserSelector } from '../../../../redux';
import _ts from '../../../../ts';

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
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
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
        const values = leadAccessor.getFaramValues(lead);
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

        const values = leadAccessor.getFaramValues(lead);
        const type = leadAccessor.getType(lead);
        const errors = leadAccessor.getFaramErrors(lead);

        const isApplyAllDisabled = isFormDisabled || isBulkActionDisabled;

        return (
            <Faram
                ref={(ref) => { this.formRef = ref; }}
                className={`${styles.addLeadForm} ${className}`}
                onChange={onChange}
                onValidationFailure={onFailure}
                onValidationSuccess={onSuccess}
                schema={this.schema}
                value={values}
                error={errors}
                disabled={isFormDisabled}
            >
                {
                    (isFormLoading || isExtractionLoading) && <LoadingAnimation />
                }
                <header className={styles.header}>
                    <NonFieldErrors faramElement />
                </header>
                <HiddenInput faramElementName="sourceType" />
                {
                    type === LEAD_TYPE.website && [
                        <ExtractThis
                            key="url"
                            className={styles.url}
                            disabled={isFormDisabled || isExtractionDisabled}
                            onClick={onExtractClick}
                        >
                            <TextInput
                                faramElementName="url"
                                label={_ts('leads', 'urlLabel')}
                                placeholder={_ts('leads', 'urlPlaceholderLabel')}
                                autoFocus
                            />
                        </ExtractThis>,
                        <TextInput
                            faramElementName="website"
                            key="website"
                            label={_ts('leads', 'websiteLabel')}
                            placeholder={_ts('leads', 'urlPlaceholderLabel')}
                            className={styles.website}
                        />,
                    ]
                }
                {
                    type === LEAD_TYPE.text &&
                        <TextArea
                            faramElementName="text"
                            label={_ts('leads', 'textLabel')}
                            placeholder={_ts('leads', 'textareaPlaceholderLabel')}
                            rows="3"
                            className={styles.text}
                            autoFocus
                        />
                }
                {/* TODO: change from disabled to readonly */}
                <SelectInput
                    disabled
                    formoverrides={['disabled']}
                    faramElementName="project"
                    keySelector={LeadForm.keySelector}
                    label={_ts('leads', 'projectLabel')}
                    labelSelector={LeadForm.labelSelector}
                    options={leadOptions.project}
                    placeholder={_ts('leads', 'projectPlaceholderLabel')}
                    showHintAndError
                    showLabel
                    className={styles.project}
                />
                <div
                    className={styles.lineBreak}
                />
                <TextInput
                    className={styles.title}
                    faramElementName="title"
                    label={_ts('leads', 'titleLabel')}
                    placeholder={_ts('leads', 'titlePlaceHolderLabel')}
                />

                <ApplyAll
                    className={styles.source}
                    disabled={isApplyAllDisabled}
                    identiferName="source"
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                >
                    <TextInput
                        faramElementName="source"
                        label={_ts('leads', 'publisherLabel')}
                        placeholder={_ts('leads', 'publisherPlaceHolderLabel')}
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
                        faramElementName="confidentiality"
                        keySelector={LeadForm.keySelector}
                        label={_ts('leads', 'confidentialityLabel')}
                        labelSelector={LeadForm.labelSelector}
                        options={leadOptions.confidentiality}
                        placeholder={_ts('leads', 'selectInputPlaceholderLabel')}
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
                        faramElementName="assignee"
                        keySelector={LeadForm.keySelector}
                        label={_ts('leads', 'assigneeLabel')}
                        labelSelector={LeadForm.labelSelector}
                        options={leadOptions.assignee}
                        placeholder={_ts('leads', 'selectInputPlaceholderLabel')}
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
                        faramElementName="publishedOn"
                        label={_ts('leads', 'datePublishedLabel')}
                        placeholder={_ts('leads', 'datePublishedPlaceholderLabel')}
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
                            faramElementName="attachment"
                            key="input"
                            value={values.attachment || ''}
                        />,
                    ])
                }

            </Faram>
        );
    }
}
