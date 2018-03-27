/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSBuilders from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import {
    caseInsensitiveSubmatch,
    isTruthy,
    randomString,
} from '../../vendor/react-store/utils/common';
import { CoordinatorBuilder } from '../../vendor/react-store/utils/coordinate';
import update from '../../vendor/react-store/utils/immutable-update';
import Confirm from '../../vendor/react-store/components/View/Modal/Confirm';
import List from '../../vendor/react-store/components/View/List';

import BoundError from '../../components/BoundError';
import {
    leadFilterOptionsSelector,

    addLeadViewActiveLeadIdSelector,
    addLeadViewActiveLeadSelector,
    addLeadViewLeadsSelector,
    addLeadViewFiltersSelector,

    addLeadViewLeadChangeAction,
    addLeadViewLeadSaveAction,
    addLeadViewLeadRemoveAction,
    addLeadViewRemoveSavedLeadsAction,

    addLeadViewAddLeadsAction,
    leadsStringsSelector,
    notificationStringsSelector,
    commonStringsSelector,
    addLeadViewIsFilterEmptySelector,
    routeStateSelector,
} from '../../redux';
import {
    LEAD_FILTER_STATUS,
    LEAD_STATUS,
    calcLeadState,
    leadAccessor,
} from '../../entities/lead';
import notify from '../../notify';

import DropboxRequest from './requests/DropboxRequest';
import FileUploadRequest from './requests/FileUploadRequest';
import FormSaveRequest from './requests/FormSaveRequest';
import GoogleDriveRequest from './requests/GoogleDriveRequest';

import LeadActions from './LeadActions';
import LeadFilter from './LeadFilter';
import LeadButtons from './LeadButtons';
import LeadList from './LeadList';
import LeadFormItem from './LeadFormItem';

import styles from './styles.scss';

const mapStateToProps = state => ({
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    activeLead: addLeadViewActiveLeadSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
    filters: addLeadViewFiltersSelector(state),
    routeState: routeStateSelector(state),

    leadsStrings: leadsStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
    commonStrings: commonStringsSelector(state),
    isFilterEmpty: addLeadViewIsFilterEmptySelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
    addLeadViewLeadRemove: params => dispatch(addLeadViewLeadRemoveAction(params)),
    addLeadViewRemoveSavedLeads: params => dispatch(addLeadViewRemoveSavedLeadsAction(params)),

    addLeads: leads => dispatch(addLeadViewAddLeadsAction(leads)),
});

const propTypes = {
    activeLeadId: PropTypes.string,
    activeLead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    addLeadViewLeadRemove: PropTypes.func.isRequired,

    addLeadViewLeadSave: PropTypes.func.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,

    leadsStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    commonStrings: PropTypes.func.isRequired,
    isFilterEmpty: PropTypes.bool.isRequired,

    routeState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addLeads: PropTypes.func.isRequired,
    addLeadViewRemoveSavedLeads: PropTypes.func.isRequired,


    history: PropTypes.shape({
        replace: PropTypes.func,
    }).isRequired,

    location: PropTypes.shape({
        path: PropTypes.string,
    }).isRequired,

};

const defaultProps = {
    activeLeadId: undefined,
    activeLead: undefined,
};

const DELETE_MODE = {
    all: 'all',
    filtered: 'filtered',
    single: 'single',
    saved: 'saved',
};

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
@CSSBuilders(styles, { allowMultiple: true })
export default class LeadAdd extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calcGlobalUiState = (
        { leadUploads, leadRests, leadDriveRests, leadDropboxRests },
        { addLeadViewLeads },
    ) => (addLeadViewLeads.reduce(
        (acc, lead) => {
            const leadId = leadAccessor.getKey(lead);
            const serverError = leadAccessor.hasServerError(lead);
            const leadState = calcLeadState({
                lead,
                rest: leadRests[leadId],
                upload: leadUploads[leadId],
                drive: leadDriveRests[leadId],
                dropbox: leadDropboxRests[leadId],
            });

            // NOTE: for serverError save must be enabled
            const isSaveDisabled = !(
                leadState === LEAD_STATUS.nonPristine ||
                (LEAD_STATUS.invalid && serverError)
            );
            const isRemoveDisabled = (leadState === LEAD_STATUS.requesting);
            const isFormLoading = (leadState === LEAD_STATUS.requesting);
            const isFormDisabled = (
                leadState === LEAD_STATUS.requesting ||
                leadState === LEAD_STATUS.warning
            );
            acc[leadId] = {
                leadState,
                isSaveDisabled,
                isFormDisabled,
                isFormLoading,
                isRemoveDisabled,
            };
            return acc;
        },
        {},
    ))

    static createFilterFn = (globalUiState, { search, type, source, status }) => (lead) => {
        // FIXME: static method statusMatches was undefined, so moved it here
        const statusMatches = (leadStatus, stat) => {
            switch (stat) {
                case LEAD_FILTER_STATUS.invalid:
                    return (
                        leadStatus === LEAD_STATUS.invalid ||
                        leadStatus === LEAD_STATUS.warning
                    );
                case LEAD_FILTER_STATUS.saved:
                    return leadStatus === LEAD_STATUS.complete;
                case LEAD_FILTER_STATUS.unsaved:
                    return (
                        leadStatus === LEAD_STATUS.nonPristine ||
                        leadStatus === LEAD_STATUS.uploading ||
                        leadStatus === LEAD_STATUS.requesting
                    );
                default:
                    return false;
            }
        };

        const id = leadAccessor.getKey(lead);
        const leadType = leadAccessor.getType(lead);
        const {
            title: leadTitle = '',
            source: leadSource = '',
        } = leadAccessor.getValues(lead);

        const leadStatus = globalUiState[id].leadState;

        if (search && !caseInsensitiveSubmatch(leadTitle, search)) {
            return false;
        } else if (source && !caseInsensitiveSubmatch(leadSource, source)) {
            return false;
        } else if (type && type.length > 0 && type.indexOf(leadType) === -1) {
            return false;
        } else if (status && status.length > 0 && !statusMatches(leadStatus, status)) {
            return false;
        }
        return true;
    }

    static isSomeSaveEnabled = (list, uiState) => (
        list.some(key => !(uiState[key].isSaveDisabled))
    )

    static isSomeRemoveEnabled = (list, uiState) => (
        list.some(key => !(uiState[key].isRemoveDisabled))
    )

    constructor(props) {
        super(props);

        this.state = {
            leadUploads: {},
            leadRests: {},
            leadDriveRests: {},
            leadDropboxRests: {},
            pendingSubmitAll: false,

            showRemoveLeadModal: false,
        };

        // Store references to lead forms
        this.leadFormRefs = { };

        this.uploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
            .build();
        this.driveUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(2)
            .build();
        this.dropboxUploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(2)
            .build();

        this.formCoordinator = new CoordinatorBuilder()
            .maxActiveActors(1)
            .preSession(() => {
                this.setState({ pendingSubmitAll: true });
            })
            .postSession((totalErrors) => {
                if (totalErrors > 0) {
                    notify.send({
                        title: this.props.notificationStrings('leadSave'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('leadSaveSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } else {
                    notify.send({
                        title: this.props.notificationStrings('leadSave'),
                        type: notify.type.ERROR,
                        message: this.props.notificationStrings('leadSaveFailure'),
                        duration: notify.duration.SLOW,
                    });
                }
                this.setState({ pendingSubmitAll: false });
            })
            .build();
    }

    componentWillMount() {
        this.props.addLeadViewRemoveSavedLeads();

        const { routeState } = this.props;
        const { serverId, values } = routeState;
        if (isTruthy(serverId)) {
            const uid = randomString();
            const newLeadId = `lead-${uid}`;
            const newLead = {
                id: newLeadId,
                serverId,
                values,
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

        this.setAllLeadKeys(this.props.addLeadViewLeads);
        this.setGlobalUiState(this.state, this.props);
        this.setFilteredLeadKeys(this.props.addLeadViewLeads, this.props.filters);
        this.setCompletedLeadKeys(this.props.addLeadViewLeads);
        this.setButtonStates(this.props.isFilterEmpty);
    }

    componentWillUpdate(nextProps, nextState) {
        let allLeadKeysChanged = false;
        if (this.props.addLeadViewLeads !== nextState.addLeadViewLeads) {
            this.setAllLeadKeys(nextProps.addLeadViewLeads);
            allLeadKeysChanged = true;
        }

        let globalStateChanged = false;
        if (
            this.state.leadUploads !== nextState.leadUploads ||
            this.state.leadRests !== nextState.leadRests ||
            this.state.leadDriveRests !== nextState.leadDriveRests ||
            this.state.leadDropboxRests !== nextState.leadDropboxRests ||
            this.props.addLeadViewLeads !== nextProps.addLeadViewLeads
        ) {
            this.setGlobalUiState(nextState, nextProps);
            globalStateChanged = true;
        }

        let filteredLeadKeysChanged = false;
        if (
            this.props.addLeadViewLeads !== nextProps.addLeadViewLeads ||
            this.props.filters !== nextProps.filters ||
            globalStateChanged
        ) {
            this.setFilteredLeadKeys(nextProps.addLeadViewLeads, nextProps.filters);
            this.setCompletedLeadKeys(nextProps.addLeadViewLeads);

            filteredLeadKeysChanged = true;
        }

        if (
            this.props.isFilterEmpty !== nextProps.isFilterEmpty ||
            globalStateChanged ||
            filteredLeadKeysChanged ||
            allLeadKeysChanged
        ) {
            this.setButtonStates(nextProps.isFilterEmpty);
        }
    }

    componentWillUnmount() {
        this.uploadCoordinator.stop();
        this.driveUploadCoordinator.stop();
        this.dropboxUploadCoordinator.stop();
        this.formCoordinator.stop();
    }

    getLeadFromId = id => (
        this.props.addLeadViewLeads.find(l => id === leadAccessor.getKey(l))
    )

    setAllLeadKeys = (addLeadViewLeads) => {
        this.allLeadsKeys = addLeadViewLeads.map(leadAccessor.getKey);
    }

    setGlobalUiState = (nextState, nextProps) => {
        this.globalUiState = LeadAdd.calcGlobalUiState(nextState, nextProps);
    }

    setFilteredLeadKeys = (addLeadViewLeads, filters) => {
        const filterFn = LeadAdd.createFilterFn(this.globalUiState, filters);
        this.leadsFiltered = addLeadViewLeads.filter(filterFn);
        this.filteredLeadsKeys = this.leadsFiltered.map(leadAccessor.getKey);
    }

    setCompletedLeadKeys = (addLeadViewLeads) => {
        const filterFn = LeadAdd.createFilterFn(
            this.globalUiState,
            { status: LEAD_FILTER_STATUS.saved },
        );
        this.leadsCompleted = addLeadViewLeads.filter(filterFn);
        this.completedLeadsKeys = this.leadsCompleted.map(leadAccessor.getKey);
    }

    setButtonStates = (isFilterEmpty) => {
        // if something change
        const allEnabled = (
            this.allLeadsKeys.length >= 1
        );
        const filteredEnabled = (
            !isFilterEmpty &&
            this.filteredLeadsKeys.length >= 1
        );
        const completedEnabled = (
            this.completedLeadsKeys.length >= 1
        );

        // identify if save is enabled for all-leads
        this.isSaveEnabledForAll = (
            allEnabled &&
            LeadAdd.isSomeSaveEnabled(this.allLeadsKeys, this.globalUiState)
        );
        this.isRemoveEnabledForAll = (
            allEnabled &&
            LeadAdd.isSomeRemoveEnabled(this.allLeadsKeys, this.globalUiState)
        );

        // identify is save is enabled for filtered-leads
        this.isSaveEnabledForFiltered = (
            filteredEnabled &&
            LeadAdd.isSomeSaveEnabled(this.filteredLeadsKeys, this.globalUiState)
        );

        this.isRemoveEnabledForFiltered = (
            filteredEnabled &&
            LeadAdd.isSomeRemoveEnabled(this.filteredLeadsKeys, this.globalUiState)
        );

        this.isRemoveEnabledForCompleted = (
            completedEnabled
        );
    }

    // HANDLE SELECTION

    handleGoogleDriveSelect = (uploads) => {
        const googleDriveRequest = new GoogleDriveRequest({
            driveUploadCoordinator: this.driveUploadCoordinator,
            addLeadViewLeadChange: this.props.addLeadViewLeadChange,
            getLeadFromId: this.getLeadFromId,
            setState: params => this.setState(params),
        });

        uploads.forEach((upload) => {
            const request = googleDriveRequest.create(upload);
            this.driveUploadCoordinator.add(upload.leadId, request);
        });
        this.driveUploadCoordinator.start();


        // UPLOAD
        const uploadSettings = uploads.reduce(
            (acc, upload) => {
                acc[upload.leadId] = { $auto: {
                    pending: { $set: true },
                } };
                return acc;
            },
            {},
        );
        this.setState((state) => {
            const leadDriveRests = update(state.leadDriveRests, uploadSettings);
            return { leadDriveRests };
        });
    }

    handleDropboxSelect = (uploads) => {
        const dropboxRequest = new DropboxRequest({
            dropboxUploadCoordinator: this.dropboxUploadCoordinator,
            addLeadViewLeadChange: this.props.addLeadViewLeadChange,
            getLeadFromId: this.getLeadFromId,
            setState: params => this.setState(params),
        });

        uploads.forEach((upload) => {
            const request = dropboxRequest.create(upload);
            this.dropboxUploadCoordinator.add(upload.leadId, request);
        });
        this.dropboxUploadCoordinator.start();

        // UPLOAD
        const uploadSettings = uploads.reduce(
            (acc, upload) => {
                acc[upload.leadId] = { $auto: {
                    pending: { $set: true },
                } };
                return acc;
            },
            {},
        );
        this.setState((state) => {
            const leadDropboxRests = update(state.leadDropboxRests, uploadSettings);
            return { leadDropboxRests };
        });
    }

    handleFileSelect = (uploads) => {
        const fileUploadRequest = new FileUploadRequest({
            uploadCoordinator: this.uploadCoordinator,
            addLeadViewLeadChange: this.props.addLeadViewLeadChange,
            leadsStrings: this.props.leadsStrings,
            getLeadFromId: this.getLeadFromId,
            setState: params => this.setState(params),
        });

        uploads.forEach((upload) => {
            const request = fileUploadRequest.create(upload);
            this.uploadCoordinator.add(upload.leadId, request);
        });
        this.uploadCoordinator.start();

        // UPLOAD
        const uploadSettings = uploads.reduce(
            (acc, upload) => {
                acc[upload.leadId] = { $auto: {
                    progress: { $set: 0 },
                } };
                return acc;
            },
            {},
        );
        this.setState((state) => {
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }

    // HANDLE FORM

    handleFormSubmitSuccess = (lead, newValues) => {
        // FIXME: show notifiy if individual save
        const formSaveRequest = new FormSaveRequest({
            formCoordinator: this.formCoordinator,
            addLeadViewLeadSave: this.props.addLeadViewLeadSave,
            addLeadViewLeadChange: this.props.addLeadViewLeadChange,
            getLeadFromId: this.getLeadFromId,
            setState: params => this.setState(params),
        });
        const request = formSaveRequest.create(lead, newValues);
        return request;
    }

    handleFormSubmitFailure = (id) => {
        this.formCoordinator.notifyComplete(id, true);
    }

    // UI BUTTONS

    handleRemoveButtonClick = (leadId) => {
        this.setState({
            showRemoveLeadModal: true,
            deleteMode: DELETE_MODE.single,
            leadIdForRemoval: leadId || this.props.activeLeadId,
        });
    }

    handleFilteredRemoveButtonClick = () => {
        this.setState({
            showRemoveLeadModal: true,
            deleteMode: DELETE_MODE.filtered,
        });
    }

    handleSavedRemoveButtonClick = () => {
        this.setState({
            showRemoveLeadModal: true,
            deleteMode: DELETE_MODE.saved,
        });
    }

    handleBulkRemoveButtonClick = () => {
        this.setState({
            showRemoveLeadModal: true,
            deleteMode: DELETE_MODE.all,
        });
    }

    handleRemoveLeadModalClose = (confirm) => {
        const {
            leadIdForRemoval: leadId,
            deleteMode,
        } = this.state;

        if (confirm) {
            switch (deleteMode) {
                case DELETE_MODE.single:
                    this.removeSelected(leadId);
                    break;
                case DELETE_MODE.filtered:
                    this.removeFiltered();
                    break;
                case DELETE_MODE.all:
                    this.removeBulk();
                    break;
                case DELETE_MODE.saved:
                    this.removeCompleted();
                    break;
                default:
                    break;
            }
        }

        this.setState({
            showRemoveLeadModal: false,
            leadIdForRemoval: undefined,
            deleteMode: undefined,
        });
    }

    removeSelected = (leadId) => {
        this.uploadCoordinator.remove(leadId);
        this.props.addLeadViewLeadRemove(leadId);

        notify.send({
            title: this.props.notificationStrings('leadDiscard'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('leadDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeFiltered = () => {
        this.filteredLeadsKeys.forEach((leadId) => {
            this.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: this.props.notificationStrings('leadsDiscard'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeCompleted = () => {
        this.completedLeadsKeys.forEach((leadId) => {
            this.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: this.props.notificationStrings('leadsDiscard'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    removeBulk = () => {
        this.allLeadsKeys.forEach((leadId) => {
            this.uploadCoordinator.remove(leadId);
            this.props.addLeadViewLeadRemove(leadId);
        });

        notify.send({
            title: this.props.notificationStrings('leadsDiscard'),
            type: notify.type.SUCCESS,
            message: this.props.notificationStrings('leadsDiscardSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleSaveButtonClick = () => {
        const leadId = this.props.activeLeadId;
        const activeLeadForm = this.leadFormRefs[leadId];
        if (activeLeadForm) {
            activeLeadForm.start();
        }
    }

    handleFilteredSaveButtonClick = () => {
        this.filteredLeadsKeys.forEach((id) => {
            this.formCoordinator.add(id, this.leadFormRefs[id]);
        });
        this.formCoordinator.start();
    }

    handleBulkSaveButtonClick = () => {
        this.allLeadsKeys.forEach((id) => {
            this.formCoordinator.add(id, this.leadFormRefs[id]);
        });
        this.formCoordinator.start();
    }

    // RENDER

    referenceForLeadDetail = key => (elem) => {
        if (elem) {
            this.leadFormRefs[key] = elem.getWrappedInstance();
        }
    }

    renderLeadDetail = (key, lead) => {
        const {
            isSaveDisabled,
            isFormDisabled,
            isFormLoading,
        } = this.globalUiState[key] || {};
        const {
            activeLeadId,
            leadFilterOptions,
        } = this.props;
        const { pendingSubmitAll } = this.state;

        const { project } = leadAccessor.getValues(lead);
        const leadOptions = leadFilterOptions[project];
        return (
            <LeadFormItem
                ref={this.referenceForLeadDetail(key)}
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
            leadUploads,
            showRemoveLeadModal,
            pendingSubmitAll,
        } = this.state;
        const {
            activeLead,
            activeLeadId,
            addLeadViewLeads,
        } = this.props;

        // identify is save is enabled for active-lead
        const {
            isSaveDisabled: isSaveDisabledForActive,
            isRemoveDisabled: isRemoveDisabledForActive,
        } = this.globalUiState[activeLeadId] || {};

        return (
            <div className={styles.addLead}>
                <Prompt
                    when={this.isSaveEnabledForAll}
                    message={this.props.commonStrings('youHaveUnsavedChanges')}
                />
                <header className={styles.header}>
                    <LeadFilter />
                    { activeLead &&
                        <LeadActions
                            isRemoveDisabledForActive={isRemoveDisabledForActive}
                            isRemoveEnabledForAll={this.isRemoveEnabledForAll}
                            isRemoveEnabledForFiltered={this.isRemoveEnabledForFiltered}
                            isRemoveEnabledForCompleted={this.isRemoveEnabledForCompleted}
                            isSaveDisabledForActive={isSaveDisabledForActive}
                            isSaveEnabledForAll={this.isSaveEnabledForAll}
                            isSaveEnabledForFiltered={this.isSaveEnabledForFiltered}
                            pendingSubmitAll={pendingSubmitAll}
                            handleRemoveButtonClick={this.handleRemoveButtonClick}
                            handleFilteredRemoveButtonClick={this.handleFilteredRemoveButtonClick}
                            handleSavedRemoveButtonClick={this.handleSavedRemoveButtonClick}
                            handleBulkRemoveButtonClick={this.handleBulkRemoveButtonClick}
                            handleSaveButtonClick={this.handleSaveButtonClick}
                            handleFilteredSaveButtonClick={this.handleFilteredSaveButtonClick}
                            handleBulkSaveButtonClick={this.handleBulkSaveButtonClick}
                        />
                    }
                </header>
                <div className={styles.content}>
                    <div className={styles.left}>
                        <LeadList
                            leads={this.leadsFiltered}
                            leadUploads={leadUploads}
                            globalUiState={this.globalUiState}
                            onLeadRemove={this.handleRemoveButtonClick}
                        />
                        <LeadButtons
                            onDropboxSelect={this.handleDropboxSelect}
                            onGoogleDriveSelect={this.handleGoogleDriveSelect}
                            onFileSelect={this.handleFileSelect}
                        />
                    </div>
                    <List
                        data={addLeadViewLeads}
                        modifier={this.renderLeadDetail}
                        keyExtractor={leadAccessor.getKey}
                    />
                </div>
                <Confirm
                    onClose={this.handleRemoveLeadModalClose}
                    show={showRemoveLeadModal}
                >
                    <p>
                        {
                            /* TODO: different message for delete modes */
                            this.props.leadsStrings('deleteLeadConfirmText')
                        }
                    </p>
                </Confirm>
            </div>
        );
    }
}
