/**
 * @author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    requiredCondition,
    urlCondition,
} from '../../../../../public/components/Input';

import { FgRestBuilder } from '../../../../../public/utils/rest';

import {
    addLeadViewLeadChangeAction,
    addLeadViewCopyAllBelowAction,
    addLeadViewCopyAllAction,
} from '../../../../../common/redux';

import LeadForm from './LeadForm';
import DeepGallery from '../../../../../common/components/DeepGallery';
import WebsiteViewer from '../../../../../common/components/WebsiteViewer';

import {
    LEAD_TYPE,
    leadAccessor,
} from '../../../../../common/entities/lead';
import {
    urlForWebInfo,
    createParamsForWebInfo,
} from '../../../../../common/rest';
import {
    leadsString,
} from '../../../../../common/constants';
import styles from '../styles.scss';

const propTypes = {
    active: PropTypes.bool.isRequired,
    leadKey: PropTypes.string.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    onFormSubmitFailure: PropTypes.func.isRequired,
    onFormSubmitSuccess: PropTypes.func.isRequired,

    addLeadViewLeadChange: PropTypes.func.isRequired,

    addLeadViewCopyAllBelow: PropTypes.func.isRequired,
    addLeadViewCopyAll: PropTypes.func.isRequired,
};
const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewCopyAllBelow: params => dispatch(addLeadViewCopyAllBelowAction(params)),
    addLeadViewCopyAll: params => dispatch(addLeadViewCopyAllAction(params)),
});

@connect(undefined, mapDispatchToProps, null, { withRef: true })
@CSSModules(styles, { allowMultiple: true })
export default class LeadFormItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isUrlValid = url => (requiredCondition.truth(url) && urlCondition.truth(url))

    constructor(props) {
        super(props);

        const lead = leadAccessor.getValues(this.props.lead);
        const isUrlValid = LeadFormItem.isUrlValid(lead.url);
        this.state = {
            pendingExtraction: false,
            isUrlValid,
        };
    }

    componentWillReceiveProps(nextProps) {
        const oldLead = leadAccessor.getValues(this.props.lead);
        const newLead = leadAccessor.getValues(nextProps.lead);
        if (newLead.url !== oldLead.url) {
            const isUrlValid = LeadFormItem.isUrlValid(newLead.url);
            this.setState({ isUrlValid });
        }
    }

    componentWillUnmount() {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        if (this.webInfoExtractRequest) {
            this.webInfoExtractRequest.stop();
        }
    }

    createWebInfoExtractRequest = (url) => {
        const request = new FgRestBuilder()
            .url(urlForWebInfo)
            .params(createParamsForWebInfo({ url }))
            .preLoad(() => {
                this.setState({ pendingExtraction: true });
            })
            .postLoad(() => {
                this.setState({ pendingExtraction: false });
            })
            .success((response) => {
                const webInfo = response;
                const values = {};

                if (webInfo.project) {
                    values.project = [webInfo.project];
                }
                if (webInfo.date) {
                    values.publishedOn = webInfo.date;
                }
                if (webInfo.source) {
                    values.source = webInfo.source;
                }
                if (webInfo.website) {
                    values.website = webInfo.website;
                }
                if (webInfo.title) {
                    values.title = webInfo.title;
                }
                if (webInfo.url) {
                    values.url = webInfo.url;
                }

                this.props.addLeadViewLeadChange({
                    leadId: this.props.leadKey,
                    values,
                    formErrors: [],
                    formFieldErrors: {},
                    uiState: { pristine: false },
                });
            })
            .build();
        return request;
    }

    handleExtractClick = () => {
        if (this.webInfoExtractRequest) {
            this.webInfoExtractRequest.stop();
        }
        const lead = leadAccessor.getValues(this.props.lead);
        this.webInfoExtractRequest = this.createWebInfoExtractRequest(lead.url);
        this.webInfoExtractRequest.start();
    }

    handleFormSuccess = (newValues) => {
        const {
            lead,
            onFormSubmitSuccess,
        } = this.props;
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        this.leadSaveRequest = onFormSubmitSuccess(lead, newValues);
        this.leadSaveRequest.start();
    }

    handleFormChange = (values, { formErrors, formFieldErrors }) => {
        const {
            leadKey: leadId,
            addLeadViewLeadChange,
        } = this.props;

        addLeadViewLeadChange({
            leadId,
            values,
            formErrors,
            formFieldErrors,
            uiState: { pristine: false },
        });
    }

    handleFormFailure = ({ formErrors, formFieldErrors }) => {
        const {
            leadKey: leadId,
            addLeadViewLeadChange,
            onFormSubmitFailure,
        } = this.props;

        addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { pristine: true },
        });
        onFormSubmitFailure(leadId);
    }

    handleApplyAllClick = (attrName) => {
        const {
            leadKey,
            addLeadViewCopyAll,
        } = this.props;
        addLeadViewCopyAll({ leadId: leadKey, attrName });
    }

    handleApplyAllBelowClick = (attrName) => {
        const {
            leadKey,
            addLeadViewCopyAllBelow,
        } = this.props;
        addLeadViewCopyAllBelow({ leadId: leadKey, attrName });
    }

    // CO-ORDINATOR

    start = () => {
        const {
            onFormSubmitFailure,
            leadKey,
        } = this.props;

        if (this.containerRef) {
            const submittable = this.containerRef.submit();
            if (!submittable) {
                onFormSubmitFailure(leadKey);
            }
        }
    }

    stop = () => {
        // no op, cleanup not required
    }

    // RENDER

    renderLeadPreview = ({ lead }) => {
        const type = leadAccessor.getType(lead);
        const values = leadAccessor.getValues(lead);

        switch (type) {
            case LEAD_TYPE.text:
                return null;
            case LEAD_TYPE.website:
                return (
                    <div className={styles['lead-preview']} >
                        {
                            values.url ? (
                                <WebsiteViewer
                                    className={styles['gallery-file']}
                                    url={values.url}
                                    showUrl
                                />
                            ) : (
                                <div className={styles['preview-text']}>
                                    <h1>
                                        {leadsString.sourcePreview}
                                    </h1>
                                </div>
                            )
                        }
                    </div>
                );
            default:
                return (
                    <div className={styles['lead-preview']} >
                        {
                            values.attachment ? (
                                <DeepGallery
                                    className={styles['gallery-file']}
                                    galleryId={values.attachment && values.attachment.id}
                                />
                            ) :
                                <div className={styles['preview-text']}>
                                    <h1>
                                        {leadsString.previewNotAvailable}
                                    </h1>
                                </div>
                        }
                    </div>
                );
        }
    }

    render() {
        const {
            active,
            lead,
            leadKey, // eslint-disable-line no-unused-vars
            onFormSubmitFailure, // eslint-disable-line no-unused-vars
            onFormSubmitSuccess, // eslint-disable-line no-unused-vars
            addLeadViewLeadChange, // eslint-disable-line no-unused-vars
            addLeadViewCopyAllBelow, // eslint-disable-line no-unused-vars
            addLeadViewCopyAll, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const LeadPreview = this.renderLeadPreview;

        return (
            <div className={`${styles.right} ${!active ? styles.hidden : ''}`}>
                <LeadForm
                    ref={(ref) => { this.containerRef = ref; }}
                    className={styles['add-lead-form']}
                    lead={lead}
                    onChange={this.handleFormChange}
                    onFailure={this.handleFormFailure}
                    onSuccess={this.handleFormSuccess}
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                    isExtractionLoading={this.state.pendingExtraction}
                    isExtractionDisabled={!this.state.isUrlValid}
                    onExtractClick={this.handleExtractClick}
                    {...otherProps}
                />
                { active && <LeadPreview lead={lead} /> }
            </div>
        );
    }
}
