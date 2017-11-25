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

import AddLeadFilter from './AddLeadFilter';
import AddLeadList from './AddLeadList';
import AddLeadButtons from './AddLeadButtons';
import AddLeadFormItem from './AddLeadFormItem';
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

    activeLeadId: PropTypes.string.isRequired,
    addLeadViewLeadChange: PropTypes.func.isRequired,
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line
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

    createUploderForFileUpload = ({ file, url, params, leadId }) => {
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
            .abort((response, status) => {
                this.handleLeadUploadFailure(leadId, status);
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
        const uploadSettings = {
            [leadId]: {
                progress: { $set: 100 },
                isCompleted: { $set: true },
            },
        };
        const leadUploads = update(this.state.leadUploads, uploadSettings);
        this.setState({ leadUploads });
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
        const uploadSettings = {
            [leadId]: {
                progress: { $set: 100 },
                isCompleted: { $set: true },
            },
        };
        const leadUploads = update(this.state.leadUploads, uploadSettings);
        this.setState({ leadUploads });
    }

    handleLeadUploadPreLoad = (leadId) => {
        const settings = {
            [leadId]: { $auto: {
                progress: { $set: 0 },
                isCompleted: { $set: false },
            } },
        };
        const leadUploads = update(this.state.leadUploads, settings);
        this.setState({ leadUploads });
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
            uiState: { stale: true, ready: true },
        });

        // FOR UPLAOD
        const settings = {
            [leadId]: { $auto: {
                progress: { $set: 100 },
                isCompleted: { $set: true },
            } },
        };
        const leadUploads = update(this.state.leadUploads, settings);
        this.setState({ leadUploads });
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
        const settings = {
            [leadId]: { $auto: {
                progress: { $set: 100 },
                isCompleted: { $set: true },
            } },
        };
        const leadUploads = update(this.state.leadUploads, settings);
        this.setState({ leadUploads });
    }

    handleLeadUploadProgress = (leadId, progress) => {
        const theLeadUpload = this.state.leadUploads[leadId];
        if (!theLeadUpload || theLeadUpload.progress === progress) {
            return;
        }

        const settings = {
            [leadId]: { $auto: {
                progress: { $set: progress },
                isCompleted: { $set: false },
            } },
        };
        const leadUploads = update(this.state.leadUploads, settings);
        this.setState({ leadUploads });
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

        const settings = {
            [leadId]: { $auto: {
                progress: { $set: 0 },
                isCompleted: { $set: false },
            } },
        };
        const leadUploads = update(this.state.leadUploads, settings);
        this.setState({ leadUploads });
    }

    handleDropboxSelect = (leadId, doc) => {
        const request = this.createRequestForDropboxUpload({
            leadId,
            title: doc.name,
            fileUrl: doc.link,
        });
        request.start();

        const settings = {
            [leadId]: { $auto: {
                progress: { $set: 0 },
                isCompleted: { $set: false },
            } },
        };
        const leadUploads = update(this.state.leadUploads, settings);
        this.setState({ leadUploads });
    }

    // UI

    leadDetailKeyExtractor = lead => lead.data.id;

    renderLeadDetail = (key, lead) => {
        const leadOptions = this.props.leadFilterOptions[lead.form.values.project];
        const { activeLeadId } = this.props;
        return (
            <AddLeadFormItem
                key={key}
                leadKey={key}
                lead={lead}
                leadOptions={leadOptions}
                activeLeadId={activeLeadId}

                onChange={this.handleFormChange}
                onFailure={this.handleFormFailure}
                onSuccess={this.handleFormSuccess}
                onPrev={this.handleLeadPrev}
                onNext={this.handleLeadNext}
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
                    <AddLeadFilter />
                    <AddLeadList leadUploads={leadUploads} />
                    <AddLeadButtons
                        onDropboxSelect={this.handleDropboxSelect}
                        onGoogleDriveSelect={this.handleGoogleDriveSelect}
                        onNewUploader={this.createUploderForFileUpload}
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
