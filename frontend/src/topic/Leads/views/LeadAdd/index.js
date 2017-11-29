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
import { Coordinator, UploadBuilder } from '../../../../public/utils/Uploader';

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
} from '../../../../common/rest';

import {
    setNavbarStateAction,
    tokenSelector,
    addLeadViewLeadChangeAction,
    addLeadViewActiveLeadIdSelector,
    addLeadViewActiveLeadSelector,
    addLeadViewLeadsSelector,
    leadFilterOptionsSelector,

    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
    addLeadViewLeadRemoveAction,
    addLeadViewCanNextSelector,
    addLeadViewCanPrevSelector,
} from '../../../../common/redux';

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
        };
        this.leadRefs = {
        };

        this.uploadCoordinator = new Coordinator();
        this.formCoordinator = new Coordinator();
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
            .success((response) => {
                this.handleLeadGoogleDriveUploadSuccess(leadId, response);
            })
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
            .success((response) => {
                this.handleLeadDropboxUploadSuccess(leadId, response);
            })
            .retryTime(1000)
            .build();
        return dropboxUploadRequest;
    }

    createUploaderForFileUpload = ({ file, url, params, leadId }) => {
        const uploader = new UploadBuilder()
            .file(file)
            .url(url)
            .params(params)
            .preLoad(() => {
                this.handleLeadUploadPreLoad(leadId);
            })
            .progress((progressPercent) => {
                this.handleLeadUploadProgress(leadId, progressPercent);
            })
            .success((response) => {
                this.handleLeadUploadSuccess(leadId, response);
            })
            .failure((response, status) => {
                this.handleLeadUploadFailure(leadId, status);
            })
            .fatal((response, status) => {
                this.handleLeadUploadFailure(leadId, status);
            })
            .abort(() => {
                // console.warn('aborted');
                this.handleLeadUploadFailure(leadId, 0);
            })
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
            uiState: { stale: true, ready: true },
        });

        // FOR UPLOAD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 100 },
                    isCompleted: { $set: true },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
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
            uiState: { stale: true, ready: true },
        });

        // FOR UPLOAD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 100 },
                    isCompleted: { $set: true },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }

    handleLeadUploadPreLoad = (leadId) => {
        // console.warn('START', leadId);
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 0 },
                    isCompleted: { $set: false },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }

    handleLeadUploadSuccess = (leadId, response) => {
        // console.warn('SUCCESS', leadId);
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: response.id },
            upload: {
                title: response.title,
                url: response.file,
            },
            uiState: { stale: true, ready: true },
        });

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 100 },
                    isCompleted: { $set: true },
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
            upload: { errorMessage: `Failed to upload file (${status})` },
            uiState: { stale: false, ready: true },
            formErrors: [`Failed to upload file (${status})`],
        });

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 100 },
                    isCompleted: { $set: true },
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
            // console.warn('PROGRESS MISSED', leadId, progress, this.state.leadUploads);
            return;
        }
        // console.warn('PROGRESS', leadId, progress);
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: progress },
                    isCompleted: { $set: false },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
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

        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 0 },
                    isCompleted: { $set: false },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }

    handleDropboxSelect = (leadId, doc) => {
        const request = this.createRequestForDropboxUpload({
            leadId,
            title: doc.name,
            fileUrl: doc.link,
        });
        request.start();

        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 0 },
                    isCompleted: { $set: false },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
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
        // FIXME: Don't close and make new co-ordinator
        // just add new leads (only new leads)
        this.formCoordinator.close();

        this.formCoordinator = new Coordinator();
        const leadKeys = this.props.addLeadViewLeads
            .map(this.leadDetailKeyExtractor);
        leadKeys.forEach((id) => {
            this.formCoordinator.add(id, this.leadRefs[id]);
        });
        this.formCoordinator.start();
    }

    handleFormComplete = (id) => {
        this.formCoordinator.notifyComplete(id);
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
        return (
            <LeadFormItem
                ref={this.referenceForLeadDetail(key)}
                key={key}
                leadKey={key}
                active={key === activeLeadId}
                lead={lead}
                leadOptions={leadOptions}
                notifyComplete={this.handleFormComplete}
            />
        );
    }

    render() {
        const { leadUploads } = this.state;

        const { activeLead } = this.props;
        const { uiState } = activeLead || {};

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
                            >
                                Remove
                            </DangerButton>
                            <SuccessButton
                                onClick={this.handleSave}
                                disabled={uiState.pending || !uiState.stale || !uiState.ready}
                            >
                                Save
                            </SuccessButton>
                            <SuccessButton
                                onClick={this.handleBulkSave}
                            >
                                Bulk Save
                            </SuccessButton>
                        </div>
                    }
                </header>
                <div
                    styleName="content"
                >
                    <div styleName="left">
                        <LeadList leadUploads={leadUploads} />
                        <LeadButtons
                            uploadCoordinator={this.uploadCoordinator}
                            onDropboxSelect={this.handleDropboxSelect}
                            onGoogleDriveSelect={this.handleGoogleDriveSelect}
                            onNewUploader={this.createUploaderForFileUpload}
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
