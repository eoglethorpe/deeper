/**
 * @author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';

import {
    createParamsForLeadEdit,
    createParamsForLeadCreate,
    urlForLead,
    createUrlForLeadEdit,
} from '../../../../common/rest';
import {
    tokenSelector,
    addLeadViewLeadSetPendingAction,
    addLeadViewLeadSaveAction,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    addLeadViewLeadChangeAction,
    addLeadViewLeadRemoveAction,
} from '../../../../common/redux';

import AddLeadForm from '../../components/AddLeadForm';

import styles from './styles.scss';

const propTypes = {

    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,

    leadKey: PropTypes.string.isRequired,
    activeLeadId: PropTypes.string.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line
    leadOptions: PropTypes.object.isRequired, // eslint-disable-line

    addLeadViewLeadSave: PropTypes.func.isRequired,
    addLeadViewLeadSetPending: PropTypes.func.isRequired,
    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,
    addLeadViewLeadRemove: PropTypes.func.isRequired,
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
    addLeadViewLeadNext: params => dispatch(addLeadViewLeadNextAction(params)),
    addLeadViewLeadPrev: params => dispatch(addLeadViewLeadPrevAction(params)),
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadRemove: params => dispatch(addLeadViewLeadRemoveAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadFormItem extends React.PureComponent {
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
            })
            .failure((response) => {
                console.error('Failed lead request:', response);
            })
            .fatal((response) => {
                console.error('Fatal error occured during lead request:', response);
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
        });
    }

    handleFormSuccess = () => {
        if (this.leadSaveRequest) {
            this.leadSaveRequest.stop();
        }
        this.leadSaveRequest = this.createLeadRequest(this.props.lead);
        this.leadSaveRequest.start();
    }

    handleLeadNext = () => {
        const leadId = this.props.leadKey;
        this.props.addLeadViewLeadNext(leadId);
    }

    handleLeadPrev = () => {
        const leadId = this.props.leadKey;
        this.props.addLeadViewLeadPrev(leadId);
    }

    handleRemove = () => {
        const leadId = this.props.leadKey;
        this.props.addLeadViewLeadRemove(leadId);
    }

    render() {
        console.log('Rendering AddLeadFormItem');

        const {
            leadKey,
            lead,
            leadOptions,
            activeLeadId,
        } = this.props;

        return (
            <div className={`${styles.right} ${leadKey !== activeLeadId ? styles.hidden : ''}`} >
                <AddLeadForm
                    className={styles['add-lead-form']}
                    lead={lead}
                    leadOptions={leadOptions}
                    onChange={this.handleFormChange}
                    onFailure={this.handleFormFailure}
                    onSuccess={this.handleFormSuccess}
                    onPrev={this.handleLeadPrev}
                    onNext={this.handleLeadNext}
                    onRemove={this.handleRemove}
                />
                <div className={styles['lead-preview']} >
                    LEAD PREVIEW
                </div>
            </div>
        );
    }
}
