/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSBuilders from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';

import { CoordinatorBuilder } from '../../../../public/utils/coordinate';
import { caseInsensitiveSubmatch } from '../../../../public/utils/common';
import update from '../../../../public/utils/immutable-update';
import Confirm from '../../../../public/components/View/Modal/Confirm';
import List from '../../../../public/components/View/List';
import Button from '../../../../public/components/Action/Button';
import DropdownMenu from '../../../../public/components/Action/DropdownMenu';

import {
    leadFilterOptionsSelector,

    addLeadViewActiveLeadIdSelector,
    addLeadViewActiveLeadSelector,
    addLeadViewLeadsSelector,
    addLeadViewFiltersSelector,

    addLeadViewLeadChangeAction,
    addLeadViewLeadSaveAction,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    addLeadViewLeadRemoveAction,

    addLeadViewCanNextSelector,
    addLeadViewCanPrevSelector,

    leadsStringsSelector,
    notificationStringsSelector,
    commonStringsSelector,
} from '../../../../common/redux';
import {
    LEAD_FILTER_STATUS,
    LEAD_STATUS,
    calcLeadState,
    leadAccessor,
} from '../../../../common/entities/lead';
import { iconNames } from '../../../../common/constants';
import notify from '../../../../common/notify';

import DropboxBuilder from './utils/builder/DropboxBuilder';
import FileUploadBuilder from './utils/builder/FileUploadBuilder';
import FormSaveBuilder from './utils/builder/FormSaveBuilder';
import GoogleDriveBuilder from './utils/builder/GoogleDriveBuilder';
import LeadFilter from './components/LeadFilter';
import LeadButtons from './components/LeadButtons';
import LeadList from './components/LeadList';
import LeadFormItem from './components/LeadFormItem';

import styles from './styles.scss';

const mapStateToProps = state => ({
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    activeLead: addLeadViewActiveLeadSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
    filters: addLeadViewFiltersSelector(state),
    addLeadViewCanNext: addLeadViewCanNextSelector(state),
    addLeadViewCanPrev: addLeadViewCanPrevSelector(state),

    leadsStrings: leadsStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
    commonStrings: commonStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
    addLeadViewLeadNext: params => dispatch(addLeadViewLeadNextAction(params)),
    addLeadViewLeadPrev: params => dispatch(addLeadViewLeadPrevAction(params)),
    addLeadViewLeadRemove: params => dispatch(addLeadViewLeadRemoveAction(params)),
});

const propTypes = {
    activeLeadId: PropTypes.string,
    activeLead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,
    addLeadViewLeadRemove: PropTypes.func.isRequired,
    addLeadViewCanNext: PropTypes.bool.isRequired,
    addLeadViewCanPrev: PropTypes.bool.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    addLeadViewLeadSave: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    addLeadViewLeadChange: PropTypes.func.isRequired,

    leadsStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    activeLeadId: undefined,
    activeLead: undefined,
};

const DELETE_MODE = {
    all: 'all',
    filtered: 'filtered',
    single: 'single',
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSBuilders(styles, { allowMultiple: true })
export default class LeadAdd extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static statusMatches = (leadStatus, status) => {
        switch (status) {
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

    static calcGlobalUiState = (
        { leadUploads, leadRests, leadDriveRests, leadDropboxRests },
        { addLeadViewLeads },
    ) => (addLeadViewLeads.reduce(
        (acc, lead) => {
            const leadId = leadAccessor.getKey(lead);
            const leadState = calcLeadState({
                lead,
                rest: leadRests[leadId],
                upload: leadUploads[leadId],
                drive: leadDriveRests[leadId],
                dropbox: leadDropboxRests[leadId],
            });
            const isSaveDisabled = (leadState !== LEAD_STATUS.nonPristine);
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
        const id = leadAccessor.getKey(lead);
        const leadType = leadAccessor.getType(lead);
        const {
            title: leadTitle = '',
            source: leadSource = '',
        } = leadAccessor.getValues(lead);

        const leadStatus = globalUiState[id].leadState;

        if (!caseInsensitiveSubmatch(leadTitle, search)) {
            return false;
        } else if (!caseInsensitiveSubmatch(leadSource, source)) {
            return false;
        } else if (type && type.length > 0 && type.indexOf(leadType) === -1) {
            return false;
        } else if (status && status.length > 0 && !LeadAdd.statusMatches(leadStatus, status)) {
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
            .postSession(() => {
                this.setState({ pendingSubmitAll: false });
            })
            .build();
    }

    componentWillUnmount() {
        this.uploadCoordinator.stop();
        this.driveUploadCoordinator.stop();
        this.dropboxUploadCoordinator.stop();
        this.formCoordinator.stop();
    }

    // HANDLE SELECTION

    handleGoogleDriveSelect = (uploads) => {
        const googleDriveBuilder = new GoogleDriveBuilder(this);
        uploads.forEach((upload) => {
            const request = googleDriveBuilder.createRequest(upload);
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
        const dropboxBuilder = new DropboxBuilder(this);
        uploads.forEach((upload) => {
            const request = dropboxBuilder.createRequest(upload);
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
        const fileUploadBuilder = new FileUploadBuilder(this);
        uploads.forEach((upload) => {
            const request = fileUploadBuilder.createRequest(upload);
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
        const formSaveBuilder = new FormSaveBuilder(this);
        const request = formSaveBuilder.createRequest(lead, newValues);
        return request;
    }

    handleFormSubmitFailure = (id) => {
        this.formCoordinator.notifyComplete(id);
    }

    // UI BUTTONS

    handleNextButtonClick = () => {
        this.props.addLeadViewLeadNext();
    }

    handlePrevButtonClick = () => {
        this.props.addLeadViewLeadPrev();
    }

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
            pendingSubmitAll,
            showRemoveLeadModal,
        } = this.state;
        const {
            activeLead,
            activeLeadId,
            addLeadViewCanPrev,
            addLeadViewCanNext,
            addLeadViewLeads,
            filters,
        } = this.props;

        // calculate all globalUiState
        const globalUiState = LeadAdd.calcGlobalUiState(this.state, this.props);

        // filter leads
        const filterFn = LeadAdd.createFilterFn(globalUiState, filters);
        const leadsFiltered = addLeadViewLeads.filter(filterFn);

        const allLeadsKeys = addLeadViewLeads.map(leadAccessor.getKey);
        const filteredLeadsKeys = leadsFiltered.map(leadAccessor.getKey);

        const allEnabled = (
            allLeadsKeys.length > 1
        );
        const filteredEnabled = (
            allLeadsKeys.length > 1 &&
            allLeadsKeys.length !== filteredLeadsKeys.length &&
            filteredLeadsKeys.length > 0
        );

        // identify if save is enabled for all-leads
        const isSaveEnabledForAll = (
            allEnabled &&
            LeadAdd.isSomeSaveEnabled(allLeadsKeys, globalUiState)
        );
        const isRemoveEnabledForAll = (
            allEnabled &&
            LeadAdd.isSomeRemoveEnabled(allLeadsKeys, globalUiState)
        );

        // identify is save is enabled for filtered-leads
        const isSaveEnabledForFiltered = (
            filteredEnabled &&
            LeadAdd.isSomeSaveEnabled(filteredLeadsKeys, globalUiState)
        );

        const isRemoveEnabledForFiltered = (
            filteredEnabled &&
            LeadAdd.isSomeRemoveEnabled(filteredLeadsKeys, globalUiState)
        );

        // identify is save is enabled for active-lead
        const {
            isSaveDisabled: isSaveDisabledForActive,
            isRemoveDisabled: isRemoveDisabledForActive,
        } = globalUiState[activeLeadId] || {};

        this.globalUiState = globalUiState;
        this.allLeadsKeys = allLeadsKeys;
        this.filteredLeadsKeys = filteredLeadsKeys;

        return (
            <div styleName="add-lead">
                <Prompt
                    when={isSaveEnabledForAll}
                    message={this.props.commonStrings('youHaveUnsavedChanges')}
                />
                <header styleName="header">
                    <LeadFilter />
                    { activeLead &&
                        <div styleName="action-buttons">
                            <div styleName="movement-buttons">
                                <Button
                                    disabled={!addLeadViewCanPrev}
                                    onClick={this.handlePrevButtonClick}
                                    iconName={iconNames.prev}
                                    title={this.props.leadsStrings('previousButtonLabel')}
                                />
                                <Button
                                    disabled={!addLeadViewCanNext}
                                    onClick={this.handleNextButtonClick}
                                    iconName={iconNames.next}
                                    title={this.props.leadsStrings('nextButtonLabel')}
                                />
                            </div>
                            <DropdownMenu
                                iconName={iconNames.delete}
                                styleName="remove-buttons"
                                title={this.props.leadsStrings('removeButtonTitle')}
                            >
                                <button
                                    styleName="dropdown-button"
                                    onClick={this.handleRemoveButtonClick}
                                    disabled={isRemoveDisabledForActive}
                                >
                                    {this.props.leadsStrings('removeCurrentButtonTitle')}
                                </button>
                                <button
                                    styleName="dropdown-button"
                                    onClick={this.handleFilteredRemoveButtonClick}
                                    disabled={!isRemoveEnabledForFiltered}
                                >
                                    {this.props.leadsStrings('removeAllFilteredButtonTitle')}

                                </button>
                                <button
                                    styleName="dropdown-button"
                                    onClick={this.handleBulkRemoveButtonClick}
                                    disabled={!isRemoveEnabledForAll}
                                >
                                    {this.props.leadsStrings('removeAllButtonTitle')}
                                </button>
                            </DropdownMenu>
                            <DropdownMenu
                                iconName={iconNames.save}
                                styleName="save-buttons"
                                title="Save" // FIXME: use strings
                            >
                                <button
                                    styleName="dropdown-button"
                                    onClick={this.handleSaveButtonClick}
                                    disabled={isSaveDisabledForActive}
                                >
                                    {this.props.leadsStrings('saveCurrentButtonTitle')}
                                </button>
                                <button
                                    styleName="dropdown-button"
                                    onClick={this.handleFilteredSaveButtonClick}
                                    disabled={pendingSubmitAll || !isSaveEnabledForFiltered}
                                >
                                    {this.props.leadsStrings('saveAllFilteredButtonTitle')}
                                </button>
                                <button
                                    styleName="dropdown-button"
                                    onClick={this.handleBulkSaveButtonClick}
                                    disabled={pendingSubmitAll || !isSaveEnabledForAll}
                                >
                                    {this.props.leadsStrings('saveAllButtonTitle')}
                                </button>
                            </DropdownMenu>
                        </div>
                    }
                </header>
                <div styleName="content">
                    <div styleName="left">
                        <LeadList
                            leads={leadsFiltered}
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
