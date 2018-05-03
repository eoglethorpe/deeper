/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { randomString } from '../../../vendor/react-store/utils/common';
import Button from '../../../vendor/react-store/components/Action/Button';
import FileInput from '../../../vendor/react-store/components/Input/FileInput';

import {
    addLeadViewAddLeadsAction,
    activeProjectIdFromStateSelector,
} from '../../../redux';
import DropboxChooser from '../../../components/DropboxChooser';
import GooglePicker from '../../../components/GooglePicker';
import ConnectorSelectModal from '../ConnectorSelectModal';
import notify from '../../../notify';
import _ts from '../../../ts';
import { iconNames } from '../../../constants';
import { LEAD_TYPE } from '../../../entities/lead';
import { dropboxAppKey } from '../../../config/dropbox';
import {
    googleDriveClientId,
    googleDriveDeveloperKey,
} from '../../../config/google-drive';

import styles from './styles.scss';

const supportedGoogleDriveMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf', 'text/plain', 'font/otf', 'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv', 'image/png', 'image/jpeg', 'image/fig',
    'application/json', 'application/xml', 'application/msword',
];

const supportedDropboxExtension = [
    '.doc', '.docx', '.rtf', '.txt',
    '.otf', '.pdf', '.ppt', '.pptx',
    '.xls', '.xlsx', '.csv', '.png',
    '.jpg', '.gif', '.json', '.xml',
];

const defaultProps = {
};

const propTypes = {
    addLeads: PropTypes.func.isRequired,
    activeProject: PropTypes.number.isRequired,
    onFileSelect: PropTypes.func.isRequired,
    onGoogleDriveSelect: PropTypes.func.isRequired,
    onDropboxSelect: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeads: leads => dispatch(addLeadViewAddLeadsAction(leads)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeadButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        // NOTE: dropbox button must be manullay disabled and enabled unlike
        // google-drive which creates an overlay and disables everything in bg
        this.state = {
            dropboxDisabled: false,
            connectorSelectModalShow: true,
        };
        // NOTE: google drive access token is received at start
        this.googleDriveAccessToken = undefined;
    }

    handleLeadAddFromGoogleDrive = (response) => {
        const { docs, action } = response;
        if (action !== 'picked') {
            return;
        }

        const { activeProject } = this.props;

        const newLeads = [];
        const uploads = [];
        docs.forEach((doc) => {
            const uid = randomString();
            const newLeadId = `lead-${uid}`;

            newLeads.unshift({
                id: newLeadId,
                faramValues: {
                    title: doc.name,
                    project: activeProject,
                    sourceType: LEAD_TYPE.drive,
                },

                pristine: false,
            });

            uploads.unshift({
                leadId: newLeadId,
                accessToken: this.googleDriveAccessToken,
                title: doc.name,
                fileId: doc.id,
                mimeType: doc.mimeType,
            });
        });

        this.props.addLeads(newLeads);
        this.props.onGoogleDriveSelect(uploads);
    }

    handleLeadAddFromDropbox = (response) => {
        if (response.length <= 0) {
            console.warn('Empty response from dropbox');
            return;
        }
        const { activeProject } = this.props;

        const newLeads = [];
        const uploads = [];
        response.forEach((doc) => {
            const uid = randomString();
            const newLeadId = `lead-${uid}`;

            newLeads.unshift({
                id: newLeadId,
                faramValues: {
                    title: doc.name,
                    project: activeProject,
                    sourceType: LEAD_TYPE.dropbox,
                },

                pristine: false,
            });

            uploads.unshift({
                leadId: newLeadId,
                title: doc.name,
                fileUrl: doc.link,
            });
        });

        this.props.addLeads(newLeads);
        this.props.onDropboxSelect(uploads);

        this.setState({ dropboxDisabled: false });
    }

    handleLeadAddFromDisk = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: _ts('notification', 'fileSelection'),
                type: notify.type.WARNING,
                message: _ts('notification', 'invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        const { activeProject } = this.props;

        const newLeads = [];
        const uploads = [];
        files.forEach((file) => {
            const uid = randomString();
            const newLeadId = `lead-${uid}`;

            newLeads.unshift({
                id: newLeadId,
                faramValues: {
                    title: file.name,
                    project: activeProject,
                    sourceType: LEAD_TYPE.file,
                },

                pristine: false,
            });

            uploads.unshift({
                file,
                leadId: newLeadId,
            });
        });

        this.props.addLeads(newLeads);
        this.props.onFileSelect(uploads);
    }

    handleLeadAddFromWebsite = () => {
        const { activeProject } = this.props;
        const newLeads = [];

        const uid = randomString();
        const newLeadId = `lead-${uid}`;

        newLeads.unshift({
            id: newLeadId,
            faramValues: {
                title: `Lead ${(new Date()).toLocaleTimeString()}`,
                project: activeProject,
                sourceType: LEAD_TYPE.website,
            },

            pristine: false,
        });

        this.props.addLeads(newLeads);
    }

    handleLeadAddFromText = () => {
        const { activeProject } = this.props;
        const newLeads = [];

        const uid = randomString();
        const newLeadId = `lead-${uid}`;

        newLeads.unshift({
            id: newLeadId,
            faramValues: {
                title: `Lead ${(new Date()).toLocaleTimeString()}`,
                project: activeProject,
                sourceType: LEAD_TYPE.text,
            },

            pristine: false,
        });

        this.props.addLeads(newLeads);
    }

    handleGoogleDriveOnAuthenticated = (accessToken) => {
        if (accessToken) {
            // NOTE: use this token later during upload
            this.googleDriveAccessToken = accessToken;
        } else {
            // FIXME: use strings
            notify.send({
                title: 'Google Drive',
                type: notify.type.ERROR,
                message: 'Authentication with google drive failed. Try again.',
                duration: notify.duration.SLOW,
            });
        }
    }

    handleDropboxChooserClick = () => this.setState({ dropboxDisabled: true });

    handleDropboxChooserCancel = () => this.setState({ dropboxDisabled: false });

    handleConnectorSelectButtonClick = () => this.setState({ connectorSelectModalShow: true });

    handleConnectorSelectModalClose = () => this.setState({ connectorSelectModalShow: false });

    render() {
        const {
            dropboxDisabled,
            connectorSelectModalShow,
        } = this.state;

        return (
            <div className={styles.addLeadButtons}>
                <h3 className={styles.heading}>
                    {_ts('leads', 'addSourceFromLabel')}
                </h3>
                <GooglePicker
                    className={styles.addLeadBtn}
                    clientId={googleDriveClientId}
                    developerKey={googleDriveDeveloperKey}
                    onAuthenticate={this.handleGoogleDriveOnAuthenticated}
                    onChange={this.handleLeadAddFromGoogleDrive}
                    mimeTypes={supportedGoogleDriveMimeTypes}
                    multiselect
                    navHidden
                >
                    <span className={iconNames.googleDrive} />
                    <p>
                        {_ts('leads', 'googleDriveLabel')}
                    </p>
                </GooglePicker>
                <DropboxChooser
                    className={styles.addLeadBtn}
                    appKey={dropboxAppKey}
                    multiselect
                    extensions={supportedDropboxExtension}
                    success={this.handleLeadAddFromDropbox}
                    onClick={this.handleDropboxChooserClick}
                    cancel={this.handleDropboxChooserCancel}
                    disabled={dropboxDisabled}
                >
                    <span className={iconNames.dropbox} />
                    <p>
                        {_ts('leads', 'dropboxLabel')}
                    </p>
                </DropboxChooser>
                <FileInput
                    className={styles.addLeadBtn}
                    onChange={this.handleLeadAddFromDisk}
                    showStatus={false}
                    multiple
                    accept=".pdf, .ppt, .pptx, .csv, .xls, .xlsx, .doc, .docx, .odt, .rtf, image/*"
                >
                    <span className={iconNames.upload} />
                    <p>
                        {_ts('leads', 'localDiskLabel')}
                    </p>
                </FileInput>
                <Button
                    className={styles.addLeadBtn}
                    transparent
                    onClick={this.handleLeadAddFromWebsite}
                >
                    <span className={iconNames.globe} />
                    <p>
                        {_ts('leads', 'websiteLabel')}
                    </p>
                </Button>
                <Button
                    className={styles.addLeadBtn}
                    transparent
                    onClick={this.handleLeadAddFromText}
                >
                    <span className={iconNames.clipboard} />
                    <p>
                        {_ts('leads', 'textLabel')}
                    </p>
                </Button>
                <Button
                    className={styles.addLeadBtn}
                    transparent
                    onClick={this.handleConnectorSelectButtonClick}
                >
                    <span className={iconNames.link} />
                    <p>
                        {_ts('leads', 'connectorsLabel')}
                    </p>
                </Button>
                {connectorSelectModalShow &&
                    <ConnectorSelectModal
                        onModalClose={this.handleConnectorSelectModalClose}
                    />
                }
            </div>
        );
    }
}
