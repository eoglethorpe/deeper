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
import { RestBuilder } from '../../../../public/utils/rest';
import { UploadBuilder } from '../../../../public/utils/Uploader';

import { List } from '../../../../public/components/View/';
import { pageTitles } from '../../../../common/utils/labels';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,

    createParamsForLeadEdit,
    createParamsForLeadCreate,
    urlForLead,
    createUrlForLeadEdit,

    urlForGoogleDriveFileUpload,
    urlForDropboxFileUpload,
    createHeaderForGoogleDriveFileUpload,
    createHeaderForDropboxUpload,
} from '../../../../common/rest';

import {
    setNavbarStateAction,
    tokenSelector,
    activeProjectSelector,
    setLeadFilterOptionsAction,
    addLeadViewLeadChangeAction,
    addLeadViewActiveLeadIdSelector,
    addLeadViewLeadsSelector,
    addLeadViewLeadSetPendingAction,
    leadFilterOptionsSelector,
    addLeadViewLeadSaveAction,
    addLeadViewLeadNextAction,
    addLeadViewLeadPrevAction,
} from '../../../../common/redux';

import AddLeadForm from '../../components/AddLeadForm';
import AddLeadFilter from './AddLeadFilter';
import AddLeadList from './AddLeadList';
import AddLeadButtons from './AddLeadButtons';
import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    token: tokenSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadSetPending: params => dispatch(addLeadViewLeadSetPendingAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
    addLeadViewLeadNext: params => dispatch(addLeadViewLeadNextAction(params)),
    addLeadViewLeadPrev: params => dispatch(addLeadViewLeadPrevAction(params)),
});

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    activeProject: PropTypes.number.isRequired,

    setNavbarState: PropTypes.func.isRequired,

    setLeadFilterOptions: PropTypes.func.isRequired,

    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,

    activeLeadId: PropTypes.string.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,
    addLeadViewLeadSave: PropTypes.func.isRequired,
    addLeadViewLeadSetPending: PropTypes.func.isRequired,
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line
    addLeadViewLeadNext: PropTypes.func.isRequired,
    addLeadViewLeadPrev: PropTypes.func.isRequired,
};

const defaultProps = {
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            leadUploads: {},
        };
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

        const { activeProject } = this.props;
        this.requestProjectLeadFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.activeProject !== nextProps.activeProject) {
            this.requestProjectLeadFilterOptions(nextProps.activeProject);
        }
    }

    // REST REQUEST FOR PROJECT LEAD FILTERS

    requestProjectLeadFilterOptions = (activeProject) => {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line
        this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(activeProject);
        this.leadFilterOptionsRequest.start();
    }

    createRequestForGoogleDriveUpload = ({ leadId, title, accessToken, fileId, mimeType }) => {
        const googleDriveUploadRequest = new RestBuilder()
            .url(urlForGoogleDriveFileUpload)
            .params(() => {
                const { token } = this.props;
                console.log(token);
                return createHeaderForGoogleDriveFileUpload(
                    token,
                    { title, accessToken, fileId, mimeType },
                );
            })
            .success((response) => {
                try {
                    const {
                        addLeadViewLeads,
                        addLeadViewLeadChange,
                    } = this.props;
                    const theLead = addLeadViewLeads.find(lead => lead.data.id === leadId);

                    const leadSettings = {
                        upload: {
                            title: { $set: response.title },
                            url: { $set: response.file },
                        },
                        form: {
                            values: {
                                attachment: { $set: response.id },
                            },
                            errors: { $set: [] },
                        },
                        uiState: {
                            ready: { $set: true },
                        },
                    };


                    const newLead = update(theLead, leadSettings);
                    const {
                        values,
                        errors,
                        fieldErrors,
                    } = newLead.form;

                    addLeadViewLeadChange({
                        leadId,
                        values,
                        formErrors: errors,
                        formFieldErrors: fieldErrors,
                        upload: newLead.upload,
                        uiState: newLead.uiState,
                    });

                    const uploadSettings = {
                        [leadId]: {
                            progress: { $set: 100 },
                            isCompleted: { $set: true },
                        },
                    };
                    const leadUploads = update(this.state.leadUploads, uploadSettings);

                    this.setState({ leadUploads });
                } catch (er) {
                    console.error(er);
                }
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
                try {
                    const {
                        addLeadViewLeads,
                        addLeadViewLeadChange,
                    } = this.props;
                    const theLead = addLeadViewLeads.find(lead => lead.data.id === leadId);

                    const leadSettings = {
                        upload: {
                            title: { $set: response.title },
                            url: { $set: response.file },
                        },
                        form: {
                            values: {
                                attachment: { $set: response.id },
                            },
                            errors: { $set: [] },
                        },
                        uiState: {
                            ready: { $set: true },
                        },
                    };

                    const newLead = update(theLead, leadSettings);
                    const {
                        values,
                        errors,
                        fieldErrors,
                    } = newLead.form;

                    addLeadViewLeadChange({
                        leadId,
                        values,
                        formErrors: errors,
                        formFieldErrors: fieldErrors,
                        upload: newLead.upload,
                        uiState: newLead.uiState,
                    });

                    const uploadSettings = {
                        [leadId]: {
                            progress: { $set: 100 },
                            isCompleted: { $set: true },
                        },
                    };
                    const leadUploads = update(this.state.leadUploads, uploadSettings);

                    this.setState({ leadUploads });
                } catch (er) {
                    console.error(er);
                }
            })
            .retryTime(1000)
            .build();

        return dropboxUploadRequest;
    }

    createRequestForProjectLeadFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForLeadFilterOptions(activeProject);

        const leadFilterOptionsRequest = new RestBuilder()
            .url(urlForProjectFilterOptions)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .success((response) => {
                try {
                    // TODO:
                    // schema.validate(response, 'leadFilterOptionsGetResponse');
                    this.props.setLeadFilterOptions({
                        projectId: activeProject,
                        leadFilterOptions: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .retryTime(1000)
            .build();

        return leadFilterOptionsRequest;
    }

    createLeadRequest = (lead) => {
        const { access } = this.props.token;
        let url;
        let params;
        if (lead.serverId) {
            url = createUrlForLeadEdit(lead.serverId);
            params = createParamsForLeadEdit({ access }, lead.form.values);
        } else {
            url = urlForLead;
            params = () => createParamsForLeadCreate({ access }, lead.form.values);
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
                // TODO:
                // schema validation
                console.log(response);
                this.props.addLeadViewLeadSave({ leadId: lead.data.id, serverId: response.id });
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


    // HANDLE FORM

    handleFormChange = leadId => (values, { formErrors, formFieldErrors }) => {
        this.props.addLeadViewLeadChange({
            leadId,
            values,
            formErrors,
            formFieldErrors,
        });
    }

    handleFormFailure = leadId => ({ formErrors, formFieldErrors }) => {
        this.props.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
        });
    }

    handleFormSuccess = leadId => () => {
        const specificLead = this.props.addLeadViewLeads.find(lead => lead.data.id === leadId);
        const leadSaveRequest = this.createLeadRequest(specificLead);
        leadSaveRequest.start();
    }

    handleLeadNext = leadId => () => {
        this.props.addLeadViewLeadNext();
    }

    handleLeadPrev = leadId => () => {
        this.props.addLeadViewLeadPrev();
    }

    handleLeadUploadSuccess = (leadId, response) => {
        // FOR DATA CHANGE

        const {
            addLeadViewLeadChange,
            addLeadViewLeads,
        } = this.props;

        const theLead = addLeadViewLeads.find(lead => lead.data.id === leadId);

        const leadSettings = {
            upload: {
                title: { $set: response.title },
                url: { $set: response.file },
            },
            form: {
                values: {
                    attachment: { $set: response.id },
                },
                errors: { $set: [] },
            },
            uiState: {
                ready: { $set: true },
            },
        };
        const newLead = update(theLead, leadSettings);
        addLeadViewLeadChange({
            leadId,
            values: newLead.form.values,
            formErrors: newLead.form.errors,
            formFieldErrors: newLead.form.fieldErrors,
            upload: newLead.upload,
            uiState: newLead.uiState,
        });


        // FOR UPLAOD

        const { leadUploads } = this.state;
        const uploadSettings = {
            [leadId]: {
                progress: { $set: 100 },
                isCompleted: { $set: true },
            },
        };
        const newLeadUploads = update(leadUploads, uploadSettings);
        this.setState({ leadUploads: newLeadUploads });
    }

    handleLeadUploadFailure = (leadId, status) => {
        // FOR DATA CHANGE

        const {
            addLeadViewLeadChange,
            addLeadViewLeads,
        } = this.props;

        const theLead = addLeadViewLeads.find(lead => lead.data.id === leadId);

        const leadSettings = {
            upload: {
                errorMessage: { $set: `Failed to upload file (${status})` },
            },
            form: {
                values: {
                    attachment: { $set: undefined },
                },
                errors: { $set: [`Failed to upload file (${status})`] },
            },
            uiState: {
                ready: { $set: false },
            },
        };
        const newLead = update(theLead, leadSettings);
        addLeadViewLeadChange({
            leadId,
            values: newLead.form.values,
            formErrors: newLead.form.errors,
            formFieldErrors: newLead.form.fieldErrors,
            upload: newLead.upload,
            uiState: newLead.uiState,
        });


        // FOR UPLAOD
        const { leadUploads } = this.state;
        const uploadSettings = {
            [leadId]: {
                progress: { $set: 100 },
                isCompleted: { $set: true },
            },
        };
        const newLeadUploads = update(leadUploads, uploadSettings);
        this.setState({ leadUploads: newLeadUploads });
    }

    handleLeadUploadProgress = (leadId, progress) => {
        const { leadUploads } = this.state;
        const settings = {
            [leadId]: {
                progress: { $set: progress },
            },
        };
        const newLeadUploads = update(leadUploads, settings);
        this.setState({ leadUploads: newLeadUploads });
    }

    handleNewUploader = ({ file, url, params, leadId }) => {
        const uploader = new UploadBuilder()
            .file(file)
            .url(url)
            .params(params)
            .preLoad(() => {
                // TODO: use immutability helpers
                const { leadUploads } = this.state;
                leadUploads[leadId] = {
                    progress: 0,
                    isCompleted: false,
                };
                this.setState({ leadUploads });
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
            .abort((response, status) => {
                this.handleLeadUploadFailure(leadId, status);
            })
            .build();
        return uploader;
    }

    handleGoogleDriveSelect = (leadId, accessToken, doc) => {
        const request = this.createRequestForGoogleDriveUpload({
            leadId,
            accessToken,
            title: doc.name,
            fileId: doc.id,
            mimeType: doc.mimeType,
        });
        request.start();

        // TODO: use immutable
        const { leadUploads } = this.state;
        leadUploads[leadId] = {
            progress: 0,
            isCompleted: false,
        };
        this.setState({ leadUploads });
    }

    handleDropboxSelect = (leadId, doc) => {
        const request = this.createRequestForDropboxUpload({
            leadId,
            title: doc.name,
            fileUrl: doc.link,
        });
        request.start();

        // TODO: use immutable
        const { leadUploads } = this.state;
        leadUploads[leadId] = {
            progress: 0,
            isCompleted: false,
        };
        this.setState({ leadUploads });
    }

    // UI

    leadDetailKeyExtractor = lead => lead.data.id;

    renderLeadDetail = (key, lead) => {
        const leadOptions = this.props.leadFilterOptions[lead.form.values.project] || {};
        const formCallbacks = {
            onChange: this.handleFormChange(key),
            onFailure: this.handleFormFailure(key),
            onSuccess: this.handleFormSuccess(key),
            onPrev: this.handleLeadPrev(key),
            onNext: this.handleLeadNext(key),
        };

        const { activeLeadId } = this.props;

        return (
            <div
                className={`${styles.right} ${key !== activeLeadId ? styles.hidden : ''}`}
                key={key}
            >
                <AddLeadForm
                    className={styles['add-lead-form']}
                    lead={lead}
                    leadOptions={leadOptions}
                    formCallbacks={formCallbacks}
                />
                <div className={styles['lead-preview']} >
                    LEAD PREVIEW
                </div>
            </div>
        );
    }

    render() {
        const {
            leadUploads,
        } = this.state;

        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
                <div styleName="left">
                    <AddLeadFilter />
                    <AddLeadList
                        leadUploads={leadUploads}
                    />
                    <AddLeadButtons
                        onDropboxSelect={this.handleDropboxSelect}
                        onGoogleDriveSelect={this.handleGoogleDriveSelect}
                        onNewUploader={this.handleNewUploader}
                    />
                </div>
                <List
                    data={this.props.addLeadViewLeads}
                    modifier={this.renderLeadDetail}
                    keyExtractor={this.leadDetailKeyExtractor}
                />
            </div>
        );
    }
}
