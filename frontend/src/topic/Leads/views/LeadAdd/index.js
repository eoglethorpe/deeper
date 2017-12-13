/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSBuilders from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../../../public/utils/immutable-update';
import { List } from '../../../../public/components/View/';
import { CoordinatorBuilder } from '../../../../public/utils/coordinate';

import {
    PrimaryButton,
    DangerButton,
    SuccessButton,
} from '../../../../public/components/Action/';

import {
    addLeadViewLeadChangeAction,
    addLeadViewActiveLeadIdSelector,
    addLeadViewActiveLeadSelector,
    addLeadViewLeadsSelector,
    leadFilterOptionsSelector,

    addLeadViewLeadSaveAction,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    addLeadViewLeadRemoveAction,

    addLeadViewCanNextSelector,
    addLeadViewCanPrevSelector,

} from '../../../../common/redux';

import { calcLeadState, leadAccessor } from './utils/leadState';

import DropboxBuilder from './utils/builder/DropboxBuilder';
import FileUploadBuilder from './utils/builder/FileUploadBuilder';
import FormSaveBuilder from './utils/builder/FormSaveBuilder';
import GoogleDriveBuilder from './utils/builder/GoogleDriveBuilder';

import { LEAD_STATUS } from './utils/constants';
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
    addLeadViewCanNext: addLeadViewCanNextSelector(state),
    addLeadViewCanPrev: addLeadViewCanPrevSelector(state),
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
    activeLead: PropTypes.object, // eslint-disable-line
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line

    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,
    addLeadViewLeadRemove: PropTypes.func.isRequired,
    addLeadViewCanNext: PropTypes.bool.isRequired,
    addLeadViewCanPrev: PropTypes.bool.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    addLeadViewLeadSave: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    addLeadViewLeadChange: PropTypes.func.isRequired,
};

const defaultProps = {
    activeLeadId: undefined,
    activeLead: undefined,
};


@connect(mapStateToProps, mapDispatchToProps)
@CSSBuilders(styles, { allowMultiple: true })
export default class LeadAdd extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            leadUploads: {},
            leadRests: {},
            leadDriveRests: {},
            leadDropboxRests: {},
            pendingSubmitAll: false,
        };
        // Store references to lead forms
        this.leadRefs = { };

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
        this.uploadCoordinator.close();
        this.driveUploadCoordinator.close();
        this.dropboxUploadCoordinator.close();
        this.formCoordinator.close();
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

    handleLeadNext = () => {
        this.props.addLeadViewLeadNext();
    }

    handleLeadPrev = () => {
        this.props.addLeadViewLeadPrev();
    }

    handleRemove = () => {
        const leadId = this.props.activeLeadId;

        this.uploadCoordinator.remove(leadId);
        this.props.addLeadViewLeadRemove(leadId);
    }

    handleSave = () => {
        const leadId = this.props.activeLeadId;

        const activeLeadForm = this.leadRefs[leadId];
        if (activeLeadForm) {
            activeLeadForm.start();
        }
    }

    handleBulkSave = () => {
        const leadKeys = this.props.addLeadViewLeads
            .map(leadAccessor.getKey);
        leadKeys.forEach((id) => {
            this.formCoordinator.add(id, this.leadRefs[id]);
        });
        this.formCoordinator.start();
    }

    // UI

    referenceForLeadDetail = key => (elem) => {
        if (elem) {
            this.leadRefs[key] = elem.getWrappedInstance();
        }
    }

    renderLeadDetail = (key, lead) => {
        const { isSaveDisabled, isFormDisabled } = this.choices[key] || {};

        const { activeLeadId, leadFilterOptions } = this.props;
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
                isSaveDisabled={isSaveDisabled}
                isBulkActionDisabled={this.state.pendingSubmitAll}
                leadOptions={leadOptions}
                onFormSubmitFailure={this.handleFormSubmitFailure}
                onFormSubmitSuccess={this.handleFormSubmitSuccess}
            />
        );
    }

    render() {
        const {
            leadUploads,
            leadRests,
            leadDriveRests,
            leadDropboxRests,
        } = this.state;
        const {
            activeLead,
            activeLeadId,
        } = this.props;

        // calculate all choices
        this.choices = this.props.addLeadViewLeads.reduce(
            (acc, lead) => {
                const leadId = leadAccessor.getKey(lead);
                const choice = calcLeadState({
                    lead,
                    rest: leadRests[leadId],
                    upload: leadUploads[leadId],
                    drive: leadDriveRests[leadId],
                    dropbox: leadDropboxRests[leadId],
                });
                const isSaveDisabled = (choice !== LEAD_STATUS.nonstale);
                const isRemoveDisabled = (choice === LEAD_STATUS.requesting);
                const isFormDisabled = (choice === LEAD_STATUS.requesting);
                acc[leadId] = { choice, isSaveDisabled, isFormDisabled, isRemoveDisabled };
                return acc;
            },
            {},
        );

        // get choice for activeLead
        const { isSaveDisabled, isRemoveDisabled } = this.choices[activeLeadId] || {};
        // identify if save is enabled for some leads
        const someSaveEnabled = Object.keys(this.choices).some(
            key => !(this.choices[key].isSaveDisabled),
        );

        return (
            <div styleName="add-lead">
                <header
                    styleName="header"
                >
                    <LeadFilter />
                    { activeLead &&
                        <div styleName="action-buttons">
                            <PrimaryButton
                                disabled={!this.props.addLeadViewCanPrev}
                                onClick={this.handleLeadPrev}
                            >
                                Prev
                            </PrimaryButton>
                            <PrimaryButton
                                disabled={!this.props.addLeadViewCanNext}
                                onClick={this.handleLeadNext}
                            >
                                Next
                            </PrimaryButton>
                            <DangerButton
                                onClick={this.handleRemove}
                                disabled={isRemoveDisabled}
                            >
                                Remove
                            </DangerButton>
                            <SuccessButton
                                onClick={this.handleSave}
                                disabled={isSaveDisabled}
                            >
                                Save
                            </SuccessButton>
                            <SuccessButton
                                onClick={this.handleBulkSave}
                                disabled={this.state.pendingSubmitAll || !someSaveEnabled}
                            >
                                Save All
                            </SuccessButton>
                        </div>
                    }
                </header>
                <div
                    styleName="content"
                >
                    <div styleName="left">
                        <LeadList
                            leadUploads={leadUploads}
                            choices={this.choices}
                        />
                        <LeadButtons
                            onDropboxSelect={this.handleDropboxSelect}
                            onGoogleDriveSelect={this.handleGoogleDriveSelect}
                            onFileSelect={this.handleFileSelect}
                        />
                    </div>
                    <List
                        data={this.props.addLeadViewLeads}
                        modifier={this.renderLeadDetail}
                        keyExtractor={leadAccessor.getKey}
                    />
                </div>
            </div>
        );
    }
}
