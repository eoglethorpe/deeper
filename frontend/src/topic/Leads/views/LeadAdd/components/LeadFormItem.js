/**
 * @author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../../public/utils/rest';

import {
    createParamsForLeadEdit,
    createParamsForLeadCreate,
    urlForLead,
    createUrlForLeadEdit,
} from '../../../../../common/rest';
import {
    tokenSelector,
    addLeadViewLeadSetPendingAction,
    addLeadViewLeadSaveAction,
    addLeadViewLeadChangeAction,
} from '../../../../../common/redux';

import LeadForm from './LeadForm';

import styles from '../styles.scss';

const propTypes = {
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,

    leadKey: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line
    leadOptions: PropTypes.object.isRequired, // eslint-disable-line

    addLeadViewLeadSave: PropTypes.func.isRequired,
    addLeadViewLeadSetPending: PropTypes.func.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,

    notifyComplete: PropTypes.func.isRequired,
};
const defaultProps = {
    leadOptions: {},
};

const mapStateToProps = state => ({
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadSetPending: params => dispatch(addLeadViewLeadSetPendingAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })
@CSSModules(styles, { allowMultiple: true })
export default class LeadFormItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillUnmount() {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
    }

    createLeadRequest = (lead) => {
        let url;
        let params;
        if (lead.serverId) {
            url = createUrlForLeadEdit(lead.serverId);
            params = () => {
                const { access } = this.props.token;
                return createParamsForLeadEdit({ access }, lead.form.values);
            };
        } else {
            url = urlForLead;
            params = () => {
                const { access } = this.props.token;
                return createParamsForLeadCreate({ access }, lead.form.values);
            };
        }

        const leadCreateRequest = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .preLoad(() => {
                this.props.addLeadViewLeadSetPending({
                    leadId: lead.data.id,
                    pending: true,
                });
            })
            .postLoad(() => {
                this.props.addLeadViewLeadSetPending({
                    leadId: lead.data.id,
                    pending: false,
                });
            })
            .success((response) => {
                this.props.addLeadViewLeadSave({
                    leadId: lead.data.id,
                    serverId: response.id,
                });
                this.props.notifyComplete(this.props.leadKey);
            })
            .failure((response) => {
                console.error('Failed lead request:', response);
                this.props.notifyComplete(this.props.leadKey);
            })
            .fatal((response) => {
                console.error('Fatal error occured during lead request:', response);
                this.props.notifyComplete(this.props.leadKey);
            })
            .build();
        return leadCreateRequest;
    };

    handleFormChange = (values, { formErrors, formFieldErrors }) => {
        const leadId = this.props.leadKey;

        this.props.addLeadViewLeadChange({
            leadId,
            values,
            formErrors,
            formFieldErrors,
            uiState: { stale: true },
        });
    }

    handleFormFailure = ({ formErrors, formFieldErrors }) => {
        const leadId = this.props.leadKey;
        this.props.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { stale: false },
        });

        this.props.notifyComplete(this.props.leadKey);
    }

    handleFormSuccess = () => {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        this.leadSaveRequest = this.createLeadRequest(this.props.lead);
        this.leadSaveRequest.start();
    }

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
                />
                <div className={styles['lead-preview']} >
                    LEAD PREVIEW
                </div>
            </div>
        );
    }
}
