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
import { Coordinator, UploadBuilder } from '../../../../public/utils/Uploader';

import { List } from '../../../../public/components/View/';
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
    addLeadViewLeadsSelector,
    leadFilterOptionsSelector,
} from '../../../../common/redux';

import LeadFilter from './components/LeadFilter';
import LeadButtons from './components/LeadButtons';
import LeadList from './components/LeadList';
import LeadFormItem from './components/LeadFormItem';
import styles from './styles.scss';

const mapStateToProps = state => ({
    token: tokenSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
});

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,


    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,

    activeLeadId: PropTypes.string,
    addLeadViewLeadChange: PropTypes.func.isRequired,
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeLeadId: undefined,
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

        this.uploadCoordinator = new Coordinator();
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
    }

    handleLeadUploadFailure = (leadId, status) => {
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: undefined },
            upload: { errorMessage: `Failed to upload file (${status})` },
            uiState: { stale: true, ready: false },
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

    // UI

    leadDetailKeyExtractor = lead => lead.data.id;

    renderLeadDetail = (key, lead) => {
        const leadOptions = this.props.leadFilterOptions[lead.form.values.project];
        const { activeLeadId } = this.props;
        return (
            <LeadFormItem
                key={key}
                leadKey={key}
                lead={lead}
                leadOptions={leadOptions}
                activeLeadId={activeLeadId}
                uploadCoordinator={this.uploadCoordinator}
            />
        );
    }

    render() {
        const { leadUploads } = this.state;

        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
                <div styleName="left">
                    <LeadFilter />
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
        );
    }
}
