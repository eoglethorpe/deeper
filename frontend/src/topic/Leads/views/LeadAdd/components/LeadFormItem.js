/**
 * @author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addLeadViewLeadChangeAction,
    addLeadViewCopyAllBelowAction,
    addLeadViewCopyAllAction,
} from '../../../../../common/redux';

import LeadForm from './LeadForm';
import DeepGallery from '../../../../../common/components/DeepGallery';
import WebsiteViewer from '../../../../../common/components/WebsiteViewer';

import styles from '../styles.scss';

import { LEAD_TYPE } from '../utils/constants';

const propTypes = {
    leadKey: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line
    leadOptions: PropTypes.object.isRequired, // eslint-disable-line

    onFormSubmitFailure: PropTypes.func.isRequired,
    // TODO: remove disable later
    // eslint-disable-next-line
    onFormSubmitSuccess: PropTypes.func.isRequired,

    addLeadViewLeadChange: PropTypes.func.isRequired,
    addLeadViewCopyAllBelow: PropTypes.func.isRequired,
    addLeadViewCopyAll: PropTypes.func.isRequired,

    isFormDisabled: PropTypes.bool.isRequired,
    isSaveDisabled: PropTypes.bool.isRequired,
    isBulkActionDisabled: PropTypes.bool.isRequired,
};
const defaultProps = {
    leadOptions: {},
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

    componentWillUnmount() {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
    }

    handleFormChange = (values, { formErrors, formFieldErrors }) => {
        const leadId = this.props.leadKey;

        this.props.addLeadViewLeadChange({
            leadId,
            values,
            formErrors,
            formFieldErrors,
            uiState: { stale: false },
        });
    }

    handleFormFailure = ({ formErrors, formFieldErrors }) => {
        const leadId = this.props.leadKey;
        this.props.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { stale: true },
        });

        this.props.onFormSubmitFailure(this.props.leadKey);
    }

    handleFormSuccess = (newValues) => {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        this.leadSaveRequest = this.props.onFormSubmitSuccess(this.props.lead, newValues);
        this.leadSaveRequest.start();
    }

    // Called by co-ordinator

    start = () => {
        if (this.containerRef) {
            if (!this.props.isSaveDisabled) {
                this.containerRef.submit();
            } else {
                this.props.onFormSubmitFailure(this.props.leadKey);
            }
        }
    }

    close = () => {
        // do nothing, cleanup not required
    }

    handleApplyAllClick = (attrName) => {
        const { leadKey } = this.props;
        this.props.addLeadViewCopyAll({ leadId: leadKey, attrName });
    }

    handleApplyAllBelowClick = (attrName) => {
        const { leadKey } = this.props;
        this.props.addLeadViewCopyAllBelow({ leadId: leadKey, attrName });
    }

    renderLeadPreview = (lead) => {
        const type = lead.data.type;

        if (type === LEAD_TYPE.website) {
            return (
                <div className={styles['lead-preview']} >
                    <WebsiteViewer styleName="gallery-file" url={lead.form.values.url} />
                </div>
            );
        } else if (type === LEAD_TYPE.text) {
            return undefined;
        }

        return (
            <div className={styles['lead-preview']} >
                {
                    lead.form.values.attachment ? (
                        <DeepGallery
                            styleName="gallery-file"
                            galleryId={lead.form.values.attachment}
                        />
                    ) :
                        <div styleName="preview-text">
                            <h1>Preview Not Available</h1>
                        </div>
                }
            </div>
        );
    }

    render() {
        const {
            lead,
            leadOptions,
            active,
            isFormDisabled,
            isBulkActionDisabled,
        } = this.props;

        return (
            <div className={`${styles.right} ${!active ? styles.hidden : ''}`} >
                <LeadForm
                    ref={(ref) => { this.containerRef = ref; }}
                    className={styles['add-lead-form']}
                    lead={lead}
                    leadOptions={leadOptions}
                    onChange={this.handleFormChange}
                    onFailure={this.handleFormFailure}
                    onSuccess={this.handleFormSuccess}
                    isFormDisabled={isFormDisabled}
                    isBulkActionDisabled={isBulkActionDisabled}
                    onApplyAllClick={this.handleApplyAllClick}
                    onApplyAllBelowClick={this.handleApplyAllBelowClick}
                />
                {
                    this.renderLeadPreview(lead)
                }
            </div>
        );
    }
}
