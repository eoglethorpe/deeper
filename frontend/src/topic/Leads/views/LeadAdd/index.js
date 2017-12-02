/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import update from '../../../../public/utils/immutable-update';
import { List } from '../../../../public/components/View/';
import { RestBuilder } from '../../../../public/utils/rest';
import { UploadBuilder } from '../../../../public/utils/upload';
import { CoordinatorBuilder } from '../../../../public/utils/coordinate';

import {
    PrimaryButton,
    DangerButton,
    SuccessButton,
} from '../../../../public/components/Action/';
import { pageTitles } from '../../../../common/utils/labels';

import {
    urlForGoogleDriveFileUpload,
    urlForDropboxFileUpload,
    createHeaderForGoogleDriveFileUpload,
    createHeaderForDropboxUpload,

    createParamsForLeadEdit,
    createParamsForLeadCreate,
    urlForLead,
    createUrlForLeadEdit,
} from '../../../../common/rest';

import {
    setNavbarStateAction,
    tokenSelector,
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
import LeadFilter from './components/LeadFilter';
import LeadButtons from './components/LeadButtons';
import LeadList from './components/LeadList';
import LeadFormItem from './components/LeadFormItem';
import styles from './styles.scss';

const mapStateToProps = state => ({
    token: tokenSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    activeLead: addLeadViewActiveLeadSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
    addLeadViewCanNext: addLeadViewCanNextSelector(state),
    addLeadViewCanPrev: addLeadViewCanPrevSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
    addLeadViewLeadNext: params => dispatch(addLeadViewLeadNextAction(params)),
    addLeadViewLeadPrev: params => dispatch(addLeadViewLeadPrevAction(params)),
    addLeadViewLeadRemove: params => dispatch(addLeadViewLeadRemoveAction(params)),
});

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,


    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,

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
            pendingSubmitAll: false,
        };
        this.leadRefs = {
        };

        this.uploadCoordinator = new CoordinatorBuilder()
            .maxActiveActors(3)
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

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
            ],
        });
    }

    componentWillUnmount() {
        this.uploadCoordinator.close();
        this.formCoordinator.close();
    }

    // REST REQUEST

    createRequestForFormSave = (lead) => {
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

        const leadId = this.leadDetailKeyExtractor(lead);

        const leadCreateRequest = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .preLoad(() => this.handleLeadSavePreLoad(leadId))
            .postLoad(() => this.handleLeadSavePostLoad(leadId))
            .success(response => this.handleLeadSaveSuccess(leadId, response))
            .failure(response => this.handleLeadSaveFailure(leadId, response))
            .fatal(response => this.handleLeadSaveFailure(leadId, response))
            .build();
        return leadCreateRequest;
    }

    createRequestForGoogleDriveUpload = ({ leadId, title, accessToken, fileId, mimeType }) => {
        const googleDriveUploadRequest = new RestBuilder()
            .url(urlForGoogleDriveFileUpload)
            .params(() => {
                const { token } = this.props;
                return createHeaderForGoogleDriveFileUpload(
                    token,
                    { title, accessToken, fileId, mimeType },
                );
            })
            .success(response => this.handleLeadGoogleDriveUploadSuccess(leadId, response))
            .retryTime(1000)
            .build();
        return googleDriveUploadRequest;
    }

    createRequestForDropboxUpload = ({ leadId, title, fileUrl }) => {
        const dropboxUploadRequest = new RestBuilder()
            .url(urlForDropboxFileUpload)
            .params(() => {
                const { token } = this.props;
                return createHeaderForDropboxUpload(
                    token,
                    { title, fileUrl },
                );
            })
            .success(response => this.handleLeadDropboxUploadSuccess(leadId, response))
            .retryTime(1000)
            .build();
        return dropboxUploadRequest;
    }

    createUploaderForFileUpload = ({ file, url, params, leadId }) => {
        const uploader = new UploadBuilder()
            .file(file)
            .url(url)
            .params(params)
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
                    progress: { $set: 100 },
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
                    progress: { $set: 100 },
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
        console.error('Failed lead request:', response);
        this.formCoordinator.notifyComplete(leadId);
    }

    // HANDLE SELECTION

    handleGoogleDriveSelect = (leadId, accessToken, doc) => {
        const request = this.createRequestForGoogleDriveUpload({
            leadId,
            accessToken,
            title: doc.name,
            fileId: doc.id,
            mimeType: doc.mimeType,
        });
        request.start();
    }

    handleDropboxSelect = (leadId, doc) => {
        const request = this.createRequestForDropboxUpload({
            leadId,
            title: doc.name,
            fileUrl: doc.link,
        });
        request.start();
    }

    handleFileSelect = (uploads) => {
        uploads.forEach((upload) => {
            const request = this.createUploaderForFileUpload(upload);
            this.uploadCoordinator.add(upload.leadId, request);
        });
        this.uploadCoordinator.start();

        const uploadSettings = uploads.reduce(
            (acc, upload) => {
                acc[upload.leadId] = { $auto: {
                    progress: { $set: 0 },
                } };
                return acc;
            },
            {},
        );

        // UPLOAD and REST
        this.setState((state) => {
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }

    // HANDLE FORM

    handleFormSubmitSuccess = (lead) => {
        const request = this.createRequestForFormSave(lead);
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
        const leadOptions = this.props.leadFilterOptions[lead.form.values.project];
        const { activeLeadId } = this.props;

        const choice = calcLeadState({
            lead,
            rest: this.state.leadRests[key],
            upload: this.state.leadUploads[key],
        });
        const isSaveDisabled = choice !== 'nonstale';
        const isFormDisabled = (choice === 'requesting');

        return (
            <LeadFormItem
                ref={this.referenceForLeadDetail(key)}
                key={key}
                leadKey={key}
                active={key === activeLeadId}
                lead={lead}
                isFormDisabled={isFormDisabled}
                isSaveDisabled={isSaveDisabled}
                leadOptions={leadOptions}
                onFormSubmitFailure={this.handleFormSubmitFailure}
                onFormSubmitSuccess={this.handleFormSubmitSuccess}
            />
        );
    }

    render() {
        const { leadUploads, leadRests } = this.state;

        const { activeLead, activeLeadId } = this.props;

        const choice = activeLead ? calcLeadState({
            lead: activeLead,
            rest: this.state.leadRests[activeLeadId],
            upload: this.state.leadUploads[activeLeadId],
        }) : undefined;

        const isSaveDisabled = choice !== 'nonstale';
        const isRemoveDisabled = choice === 'requesting';

        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
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
                                disabled={this.state.pendingSubmitAll}
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
                            leadRests={leadRests}
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
