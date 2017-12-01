/**
 * @author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    addLeadViewLeadChangeAction,
} from '../../../../../common/redux';

import LeadForm from './LeadForm';

import styles from '../styles.scss';

const propTypes = {
    leadKey: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line
    leadOptions: PropTypes.object.isRequired, // eslint-disable-line

    onFormSubmitFailure: PropTypes.func.isRequired,
    onFormSubmitSuccess: PropTypes.func.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,

    isFormDisabled: PropTypes.bool.isRequired,
    isSaveDisabled: PropTypes.bool.isRequired,
};
const defaultProps = {
    leadOptions: {},
};

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
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

    handleFormSuccess = () => {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        this.leadSaveRequest = this.props.onFormSubmitSuccess(this.props.lead);
        this.leadSaveRequest.start();
    }

    // Called by co-ordinator

    start = () => {
        if (this.containerRef) {
            this.containerRef.submit();
        }
    }

    close = () => {
        console.log('Close forced');
    }

    render() {
        const {
            lead,
            leadOptions,
            active,
            isFormDisabled,
            isSaveDisabled,
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
                    isSaveDisabled={isSaveDisabled}
                />
                <div className={styles['lead-preview']} >
                    LEAD PREVIEW
                </div>
            </div>
        );
    }
}
