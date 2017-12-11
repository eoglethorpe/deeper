/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../../../public/utils/immutable-update';
import { List } from '../../../../public/components/View/';
import { FgRestBuilder } from '../../../../public/utils/rest';
import { UploadBuilder } from '../../../../public/utils/upload';
import { CoordinatorBuilder } from '../../../../public/utils/coordinate';

import {
    PrimaryButton,
    DangerButton,
    SuccessButton,
} from '../../../../public/components/Action/';

import {
    transformResponseErrorToFormError,

    urlForGoogleDriveFileUpload,
    urlForDropboxFileUpload,
    createHeaderForGoogleDriveFileUpload,
    createHeaderForDropboxUpload,

    urlForUpload,
    createParamsForFileUpload,

    createParamsForLeadEdit,
    createParamsForLeadCreate,
    urlForLead,
    createUrlForLeadEdit,
} from '../../../../common/rest';

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

import { calcLeadState } from './utils/leadState';
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
    addLeadViewLeadChange: PropTypes.func.isRequired,
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line

    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,
    addLeadViewLeadRemove: PropTypes.func.isRequired,
    addLeadViewCanNext: PropTypes.bool.isRequired,
    addLeadViewCanPrev: PropTypes.bool.isRequired,
    addLeadViewLeadSave: PropTypes.func.isRequired,
};

const defaultProps = {
    activeLeadId: undefined,
    activeLead: undefined,
};


@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
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
        this.leadRefs = {
        };

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

    // REST REQUEST

    createRequestForFormSave = (lead, newValues) => {
        const { serverId } = lead;
        const leadId = this.leadDetailKeyExtractor(lead);

        let url;
        let params;
        if (serverId) {
            url = createUrlForLeadEdit(serverId);
            params = () => createParamsForLeadEdit(newValues);
        } else {
            url = urlForLead;
            params = () => createParamsForLeadCreate(newValues);
        }

        const leadCreateRequest = new FgRestBuilder()
            .url(url)
            .params(params)
            .preLoad(() => this.handleLeadSavePreLoad(leadId))
            .postLoad(() => this.handleLeadSavePostLoad(leadId))
            .success(response => this.handleLeadSaveSuccess(leadId, response))
            .failure(response => this.handleLeadSaveFailure(leadId, response))
            .fatal(response => this.handleLeadSaveFatal(leadId, response))
            .build();
        return leadCreateRequest;
    }

    createRequestForGoogleDriveUpload = ({ leadId, title, accessToken, fileId, mimeType }) => {
        const googleDriveUploadRequest = new FgRestBuilder()
            .url(urlForGoogleDriveFileUpload)
            .params(createHeaderForGoogleDriveFileUpload({
                title, accessToken, fileId, mimeType,
            }))
            .success(response => this.handleLeadGoogleDriveUploadSuccess(leadId, response))
            .build();
        return googleDriveUploadRequest;
    }

    createRequestForDropboxUpload = ({ leadId, title, fileUrl }) => {
        const dropboxUploadRequest = new FgRestBuilder()
            .url(urlForDropboxFileUpload)
            .params(createHeaderForDropboxUpload({ title, fileUrl }))
            .success(response => this.handleLeadDropboxUploadSuccess(leadId, response))
            .build();
        return dropboxUploadRequest;
    }

    createUploaderForFileUpload = ({ file, leadId }) => {
        const uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .preLoad(() => this.handleLeadUploadPreLoad(leadId))
            .progress(percent => this.handleLeadUploadProgress(leadId, percent))
            .success(response => this.handleLeadUploadSuccess(leadId, response))
            .failure((response, status) => this.handleLeadUploadFailure(leadId, status))
            .fatal((response, status) => this.handleLeadUploadFailure(leadId, status))
            .abort(() => this.handleLeadUploadFailure(leadId, 0))
            .build();
        return uploader;
    }

    // CALLBACKS

    handleLeadDropboxUploadSuccess = (leadId, response) => {
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: response.id },
            upload: {
                title: response.title,
                url: response.file,
            },
            uiState: { stale: false },
        });

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: {
                    pending: { $set: undefined },
                },
            };
            const leadDropboxRests = update(state.leadDriveRests, uploadSettings);
            return { leadDropboxRests };
        });

        this.dropboxUploadCoordinator.notifyComplete(leadId);
    }

    handleLeadGoogleDriveUploadSuccess = (leadId, response) => {
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: response.id },
            upload: {
                title: response.title,
                url: response.file,
            },
            uiState: { stale: false },
        });

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: {
                    pending: { $set: undefined },
                },
            };
            const leadDriveRests = update(state.leadDriveRests, uploadSettings);
            return { leadDriveRests };
        });

        this.driveUploadCoordinator.notifyComplete(leadId);
    }

    handleLeadUploadPreLoad = (leadId) => {
        // FOR UPLOAD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 0 },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }
    handleLeadUploadSuccess = (leadId, response) => {
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: response.id },
            upload: {
                title: response.title,
                url: response.file,
            },
        });

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: undefined },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });

        this.uploadCoordinator.notifyComplete(leadId);
    }
    handleLeadUploadFailure = (leadId, status) => {
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: undefined },
            formErrors: [`Error ${status}: Failed to upload file`],
        });

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: undefined },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });

        this.uploadCoordinator.notifyComplete(leadId);
    }
    handleLeadUploadProgress = (leadId, progress) => {
        const theLeadUpload = this.state.leadUploads[leadId];
        if (!theLeadUpload || theLeadUpload.progress === progress) {
            return;
        }
        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: progress },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }

    handleLeadSavePreLoad = (leadId) => {
        // FOR REST
        this.setState((state) => {
            const restSettings = {
                [leadId]: { $auto: {
                    pending: { $set: true },
                } },
            };
            const leadRests = update(state.leadRests, restSettings);
            return { leadRests };
        });
    }
    handleLeadSavePostLoad = (leadId) => {
        // FOR REST
        this.setState((state) => {
            const restSettings = {
                [leadId]: { $auto: {
                    pending: { $set: false },
                } },
            };
            const leadRests = update(state.leadRests, restSettings);
            return { leadRests };
        });
    }
    handleLeadSaveSuccess = (leadId, response) => {
        this.props.addLeadViewLeadSave({
            leadId,
            serverId: response.id,
        });
        this.formCoordinator.notifyComplete(leadId);
    }
    handleLeadSaveFailure = (leadId, response) => {
        // console.error('Failed lead request:', response);
        const {
            formFieldErrors,
            formErrors,
        } = transformResponseErrorToFormError(response.errors);

        this.props.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { stale: true },
        });
        this.formCoordinator.notifyComplete(leadId);
    }
    handleLeadSaveFatal = (leadId, response) => {
        console.info('FATAL:', response);

        this.props.addLeadViewLeadChange({
            leadId,
            formErrors: ['Error while trying to save lead.'],
            uiState: { stale: true },
        });
        this.formCoordinator.notifyComplete(leadId);
    }

    // HANDLE SELECTION

    handleGoogleDriveSelect = (uploads) => {
        uploads.forEach((upload) => {
            const request = this.createRequestForGoogleDriveUpload(upload);
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
        uploads.forEach((upload) => {
            const request = this.createRequestForDropboxUpload(upload);
            this.dropboxUploadCoordinator.add(upload.leadId, request);
        });
        this.dropboxCoordinator.start();

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
        uploads.forEach((upload) => {
            const request = this.createUploaderForFileUpload(upload);
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
        const request = this.createRequestForFormSave(lead, newValues);
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
            .map(this.leadDetailKeyExtractor);
        leadKeys.forEach((id) => {
            this.formCoordinator.add(id, this.leadRefs[id]);
        });
        this.formCoordinator.start();
    }

    // UI

    leadDetailKeyExtractor = lead => lead.data.id;

    referenceForLeadDetail = key => (elem) => {
        if (elem) {
            this.leadRefs[key] = elem.getWrappedInstance();
        }
    }

    renderLeadDetail = (key, lead) => {
        const { isSaveDisabled, isFormDisabled } = this.choices[key] || {};

        const { activeLeadId, leadFilterOptions } = this.props;
        const leadOptions = leadFilterOptions[lead.form.values.project];
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
                const leadId = this.leadDetailKeyExtractor(lead);
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
                        keyExtractor={this.leadDetailKeyExtractor}
                    />
                </div>
            </div>
        );
    }
}
