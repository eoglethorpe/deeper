/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import {
    isTruthy,
    randomString,
} from '../../vendor/react-store/utils/common';
import { CoordinatorBuilder } from '../../vendor/react-store/utils/coordinate';
import List from '../../vendor/react-store/components/View/List';
import Message from '../../vendor/react-store/components/View/Message';
import BoundError from '../../vendor/react-store/components/General/BoundError';

import AppError from '../../components/AppError';
import {
    routeStateSelector,
    leadFilterOptionsSelector,

    addLeadViewActiveLeadIdSelector,
    addLeadViewHasActiveLeadSelector,
    addLeadViewLeadsSelector,
    addLeadViewLeadStatesSelector,

    addLeadViewAddLeadsAction,
    addLeadViewLeadChangeAction,
    addLeadViewLeadSaveAction,
    addLeadViewRemoveSavedLeadsAction,
    addLeadViewSetLeadRestsAction,
    addLeadViewButtonStatesSelector,
} from '../../redux';
import { leadAccessor } from '../../entities/lead';
import _ts from '../../ts';
import notify from '../../notify';

import FormSaveRequest from './requests/FormSaveRequest';
import LeadGroupsGetRequest from './requests/LeadGroupsGetRequest';

import LeadActions from './LeadActions';
import LeadFilter from './LeadFilter';
import LeadButtons from './LeadButtons';
import LeadList from './LeadList';
import LeadFormItem from './LeadFormItem';

import styles from './styles.scss';

const mapStateToProps = state => ({
    routeState: routeStateSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    hasActiveLead: addLeadViewHasActiveLeadSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadStates: addLeadViewLeadStatesSelector(state),
    buttonStates: addLeadViewButtonStatesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
    addLeadViewRemoveSavedLeads: params => dispatch(addLeadViewRemoveSavedLeadsAction(params)),
    addLeads: leads => dispatch(addLeadViewAddLeadsAction(leads)),
    setLeadRests: params => dispatch(addLeadViewSetLeadRestsAction(params)),
});

const propTypes = {
    activeLeadId: PropTypes.string,
    hasActiveLead: PropTypes.bool.isRequired,
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    addLeadViewLeadSave: PropTypes.func.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,

    routeState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addLeads: PropTypes.func.isRequired,
    addLeadViewRemoveSavedLeads: PropTypes.func.isRequired,

    history: PropTypes.shape({
        replace: PropTypes.func,
    }).isRequired,
    location: PropTypes.shape({
        path: PropTypes.string,
    }).isRequired,

    setLeadRests: PropTypes.func.isRequired,
    leadStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    buttonStates: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    activeLeadId: undefined,
};


@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class LeadAdd extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingSubmitAll: false,
        };

        // Store references to lead forms
        this.leadFormRefs = { };

        this.formCoordinator = new CoordinatorBuilder()
            .maxActiveActors(1)
            .preSession(() => {
                this.setState({ pendingSubmitAll: true });
            })
            .postSession((totalErrors) => {
                if (totalErrors > 0) {
                    notify.send({
                        title: _ts('notification', 'leadSave'),
                        type: notify.type.ERROR,
                        message: _ts('notification', 'leadSaveFailure', { errorCount: totalErrors }),
                        duration: notify.duration.SLOW,
                    });
                } else {
                    notify.send({
                        title: _ts('notification', 'leadSave'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'leadSaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                }
                this.setState({ pendingSubmitAll: false });
            })
            .build();
        this.uploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();
        this.driveUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(2)
            .build();
        this.dropboxUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(2)
            .build();
    }

    componentWillMount() {
        if (this.props.projectId) {
            this.startConnectorsRequest(this.props.projectId);
        }
    }

    componentDidMount() {
        this.props.addLeadViewRemoveSavedLeads();

        const { routeState } = this.props;
        const { serverId, faramValues } = routeState;
        if (isTruthy(serverId)) {
            const uid = randomString();
            const newLeadId = `lead-${uid}`;
            const newLead = {
                id: newLeadId,
                serverId,
                faramValues,
                pristine: true,
            };
            this.props.addLeads([newLead]);

            // NOTE:
            // location.state is not cleared on replace so you lose your
            // progress for the lead that was added as edit
            // So clear location.state
            const { path } = this.props.location;
            this.props.history.replace(path, {});
        }
    }

    componentWillUnmount() {
        this.formCoordinator.stop();
        this.uploadCoordinator.stop();
        this.driveUploadCoordinator.stop();
        this.dropboxUploadCoordinator.stop();
    }

    // HANDLE FORM

    handleFormSubmitSuccess = (lead, newValues) => {
        const formSaveRequest = new FormSaveRequest({
            formCoordinator: this.formCoordinator,
            addLeadViewLeadSave: this.props.addLeadViewLeadSave,
            addLeadViewLeadChange: this.props.addLeadViewLeadChange,
            setLeadRests: this.props.setLeadRests,
        });
        const request = formSaveRequest.create(lead, newValues);
        return request;
    }

    handleFormSubmitFailure = (id) => {
        this.formCoordinator.notifyComplete(id, true);
    }

    startConnectorsRequest = (projectId) => {
        if (this.requestForLeadGroups) {
            this.requestForLeadGroups.stop();
        }
        const requestForLeadGroups = new LeadGroupsGetRequest({
            setState: v => this.setState(v),
        });
        this.requestForLeadGroups = requestForLeadGroups.create(projectId);
        this.requestForLeadGroups.start();
    }

    // RENDER

    renderLeadDetail = (key, lead) => {
        const {
            activeLeadId,
            leadFilterOptions,
            leadStates,
        } = this.props;

        const {
            isSaveDisabled,
            isFormDisabled,
            isFormLoading,
        } = leadStates[key] || {};

        const { pendingSubmitAll } = this.state;

        const { project } = leadAccessor.getFaramValues(lead);
        const leadOptions = leadFilterOptions[project];

        return (
            <LeadFormItem
                ref={(elem) => {
                    this.leadFormRefs[key] = elem ? elem.getWrappedInstance() : undefined;
                }}
                key={key}
                leadKey={key}
                active={key === activeLeadId}
                lead={lead}
                isFormDisabled={isFormDisabled}
                isFormLoading={isFormLoading}
                isSaveDisabled={isSaveDisabled}
                isBulkActionDisabled={pendingSubmitAll}
                leadOptions={leadOptions}
                onFormSubmitFailure={this.handleFormSubmitFailure}
                onFormSubmitSuccess={this.handleFormSubmitSuccess}
            />
        );
    }

    render() {
        const {
            hasActiveLead,
            addLeadViewLeads,
            buttonStates,
        } = this.props;
        const { isSaveEnabledForAll } = buttonStates;
        const { pendingSubmitAll } = this.state;

        return (
            <div className={styles.addLead}>
                <Prompt
                    when={isSaveEnabledForAll}
                    message={_ts('common', 'youHaveUnsavedChanges')}
                />
                <header className={styles.header}>
                    <LeadFilter />
                    { hasActiveLead &&
                        <LeadActions
                            leadFormRefs={this.leadFormRefs}
                            formCoordinator={this.formCoordinator}
                            uploadCoordinator={this.uploadCoordinator}
                            pendingSubmitAll={pendingSubmitAll}
                        />
                    }
                </header>
                <div className={styles.content}>
                    <div className={styles.left}>
                        <LeadList />
                        <LeadButtons
                            uploadCoordinator={this.uploadCoordinator}
                            driveUploadCoordinator={this.driveUploadCoordinator}
                            dropboxUploadCoordinator={this.dropboxUploadCoordinator}
                        />
                    </div>
                    {
                        addLeadViewLeads.length === 0 ? (
                            <Message>
                                { _ts('addLeads', 'noLeadsText') }
                            </Message>
                        ) : (
                            <List
                                data={addLeadViewLeads}
                                modifier={this.renderLeadDetail}
                                keyExtractor={leadAccessor.getKey}
                            />
                        )
                    }
                </div>
            </div>
        );
    }
}
