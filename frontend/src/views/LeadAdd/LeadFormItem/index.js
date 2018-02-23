/**
 * @author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    requiredCondition,
    urlCondition,
} from '../../../vendor/react-store/components/Input/Form';
import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import ResizableV from '../../../vendor/react-store/components/View/Resizable/ResizableV';

import {
    InternalGallery,
    ExternalGallery,
} from '../../../components/DeepGallery';
import {
    addLeadViewLeadChangeAction,
    addLeadViewCopyAllBelowAction,
    addLeadViewCopyAllAction,
    leadsStringsSelector,
} from '../../../redux';
import {
    LEAD_TYPE,
    leadAccessor,
} from '../../../entities/lead';
import {
    urlForWebInfo,
    createParamsForWebInfo,
} from '../../../rest';

import LeadForm from './LeadForm';
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

    leadsStrings: PropTypes.func.isRequired,
};
const defaultProps = {
};

const mapStateToProps = state => ({
    leadsStrings: leadsStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewCopyAllBelow: params => dispatch(addLeadViewCopyAllBelowAction(params)),
    addLeadViewCopyAll: params => dispatch(addLeadViewCopyAllAction(params)),
});

const APPLY_MODE = {
    all: 'all',
    allBelow: 'allBelow',
};

@connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })
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
            isUrlValid,
            pendingExtraction: false,

            showApplyModal: false,
            applyMode: undefined, // all or below
            applyAttribute: undefined, // attribute to apply
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
                // FIXME: ravl?
                const webInfo = response;
                const values = {};
                const formFieldErrors = {};

                if (webInfo.project) {
                    values.project = [webInfo.project];
                    formFieldErrors.project = undefined;
                }
                if (webInfo.date) {
                    values.publishedOn = webInfo.date;
                    formFieldErrors.publishedOn = undefined;
                }
                if (webInfo.source) {
                    values.source = webInfo.source;
                    formFieldErrors.source = undefined;
                }
                if (webInfo.website) {
                    values.website = webInfo.website;
                    formFieldErrors.website = undefined;
                }
                if (webInfo.title) {
                    values.title = webInfo.title;
                    formFieldErrors.title = undefined;
                }
                if (webInfo.url) {
                    values.url = webInfo.url;
                    formFieldErrors.url = undefined;
                }

                this.props.addLeadViewLeadChange({
                    leadId: this.props.leadKey,
                    values,
                    formErrors: [],
                    formFieldErrors,
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

    handleFormChange = (values, { formErrors, formFieldErrors } = {}) => {
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

    handleFormFailure = ({ formErrors, formFieldErrors } = {}) => {
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
        this.setState({
            showApplyModal: true,
            applyMode: APPLY_MODE.all,
            applyAttribute: attrName,
        });
    }

    handleApplyAllBelowClick = (attrName) => {
        this.setState({
            showApplyModal: true,
            applyMode: APPLY_MODE.allBelow,
            applyAttribute: attrName,
        });
    }

    handleApplyModal = (confirm) => {
        if (confirm) {
            const {
                leadKey,
                addLeadViewCopyAll,
                addLeadViewCopyAllBelow,
            } = this.props;
            const { applyMode, applyAttribute } = this.state;
            if (applyMode === APPLY_MODE.all) {
                addLeadViewCopyAll({ leadId: leadKey, attrName: applyAttribute });
            } else if (applyMode === APPLY_MODE.allBelow) {
                addLeadViewCopyAllBelow({ leadId: leadKey, attrName: applyAttribute });
            }
        }
        this.setState({
            showApplyModal: false,
            applyMode: undefined,
            applyAttribute: undefined,
        });
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
        // Cleanup not required
        // no op
    }

    // RENDER


    referenceForLeadDetail = (elem) => {
        if (elem) {
            this.containerRef = elem.getWrappedInstance();
        }
    }

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
                                <ExternalGallery
                                    className={styles['gallery-file']}
                                    url={values.url}
                                    showUrl
                                />
                            ) : (
                                <div className={styles['preview-text']}>
                                    <h1>
                                        {this.props.leadsStrings('sourcePreview')}
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
                                <InternalGallery
                                    className={styles['gallery-file']}
                                    galleryId={values.attachment && values.attachment.id}
                                    notFoundMessage={this.props.leadsStrings('leadFileNotFound')}
                                    showUrl
                                />
                            ) :
                                <div className={styles['preview-text']}>
                                    <h1>
                                        {this.props.leadsStrings('previewNotAvailable')}
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

        const {
            showApplyModal,
            applyMode,
        } = this.state;

        const LeadPreview = this.renderLeadPreview;

        return (
            <ResizableV
                className={`${styles.right} ${!active ? styles.hidden : ''}`}
                topContainerClassName={styles.top}
                bottomContainerClassName={styles.bottom}
                topChild={[
                    <LeadForm
                        key="form"
                        ref={this.referenceForLeadDetail}
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
                    />,
                    <Confirm
                        key="confirm"
                        show={showApplyModal}
                        closeOnEscape
                        onClose={this.handleApplyModal}
                    >
                        <p>
                            {
                                applyMode === APPLY_MODE.all ? (
                                    this.props.leadsStrings('applyToAll')
                                ) : (
                                    this.props.leadsStrings('applyToAllBelow')
                                )
                            }
                        </p>
                    </Confirm>,
                ]}
                bottomChild={
                    active ? <LeadPreview lead={lead} /> : <div />
                }
            />
        );
    }
}
