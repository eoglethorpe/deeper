/**
 * @author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
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
import styles from './styles.scss';

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
export default class LeadFormItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isUrlValid = url => (requiredCondition(url).ok && urlCondition(url).ok)

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
                // FIXME: use ravl
                const webInfo = response;

                const leadValues = leadAccessor.getValues(this.props.lead);
                const leadFieldErrors = leadAccessor.getFieldErrors(this.props.lead);

                const values = { ...leadValues };
                const formFieldErrors = { ...leadFieldErrors };

                // if (webInfo.project) {
                //     values.project = [webInfo.project];
                //     formFieldErrors.project = undefined;
                // }
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
                    formErrors: {},
                    formFieldErrors,
                    uiState: { pristine: false, serverError: false },
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

    handleFormChange = (values, formFieldErrors, formErrors) => {
        const {
            leadKey: leadId,
            addLeadViewLeadChange,
        } = this.props;

        addLeadViewLeadChange({
            leadId,
            values,
            formErrors,
            formFieldErrors,
            uiState: { pristine: false, serverError: false },
        });
    }

    handleFormFailure = (formFieldErrors, formErrors) => {
        const {
            leadKey: leadId,
            addLeadViewLeadChange,
            onFormSubmitFailure,
        } = this.props;

        addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { pristine: true, serverError: false },
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
        // noop
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
                    <div className={styles.leadPreview} >
                        {
                            values.url ? (
                                <ExternalGallery
                                    className={styles.galleryFile}
                                    url={values.url}
                                    showUrl
                                />
                            ) : (
                                <div className={styles.previewText}>
                                    {this.props.leadsStrings('sourcePreview')}
                                </div>
                            )
                        }
                    </div>
                );
            default:
                return (
                    <div className={styles.leadPreview} >
                        {
                            values.attachment ? (
                                <InternalGallery
                                    className={styles.galleryFile}
                                    galleryId={values.attachment && values.attachment.id}
                                    notFoundMessage={this.props.leadsStrings('leadFileNotFound')}
                                    showUrl
                                />
                            ) :
                                <div className={styles.previewText}>
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
            leadsStrings,
            ...otherProps
        } = this.props;

        const {
            showApplyModal,
            applyMode,
        } = this.state;

        const type = leadAccessor.getType(lead);
        const disableResize = type === LEAD_TYPE.text;

        const LeadPreview = this.renderLeadPreview;

        return (
            <ResizableV
                className={`${styles.right} ${!active ? styles.hidden : ''}`}
                topContainerClassName={styles.top}
                bottomContainerClassName={styles.bottom}
                disabled={disableResize}
                topChild={
                    <Fragment>
                        <LeadForm
                            ref={this.referenceForLeadDetail}
                            className={styles.addLeadForm}
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
                        <Confirm
                            show={showApplyModal}
                            closeOnEscape
                            onClose={this.handleApplyModal}
                        >
                            <p>
                                {
                                    applyMode === APPLY_MODE.all
                                        ? leadsStrings('applyToAll')
                                        : leadsStrings('applyToAllBelow')
                                }
                            </p>
                        </Confirm>
                    </Fragment>
                }
                bottomChild={
                    active
                        ? <LeadPreview lead={lead} />
                        : <div />
                }
            />
        );
    }
}
