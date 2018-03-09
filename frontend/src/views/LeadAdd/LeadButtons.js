/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { randomString } from '../../vendor/react-store/utils/common';
import Button from '../../vendor/react-store/components/Action/Button';
import FileInput from '../../vendor/react-store/components/Input/FileInput';

import {
    addLeadViewAddLeadsAction,
    activeProjectSelector,
    leadsStringsSelector,
    notificationStringsSelector,
} from '../../redux';
import DropboxChooser from '../../components/DropboxChooser';
import GooglePicker from '../../components/GooglePicker';
import notify from '../../notify';
import { iconNames } from '../../constants';
import { LEAD_TYPE } from '../../entities/lead';
import { dropboxAppKey } from '../../config/dropbox';
import {
    googleDriveClientId,
    googleDriveDeveloperKey,
} from '../../config/google-drive';

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
    leadsStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    leadsStrings: leadsStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLeads: leads => dispatch(addLeadViewAddLeadsAction(leads)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeadButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        // NOTE: dropbox button must be manullay disabled and enabled unlike
        // google-drive which creates an overlay and disables everything in bg
        this.state = { dropboxDisabled: false };
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
                values: {
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
                values: {
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
                title: this.props.notificationStrings('fileSelection'),
                type: notify.type.WARNING,
                message: this.props.notificationStrings('invalidFileSelection'),
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
                values: {
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
            values: {
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
            values: {
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

    render() {
        const { dropboxDisabled } = this.state;

        return (
            <div styleName="add-lead-buttons">
                <h3 styleName="heading">
                    {this.props.leadsStrings('addSourceFromLabel')}
                </h3>
                <GooglePicker
                    styleName="add-lead-btn"
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
                        {this.props.leadsStrings('googleDriveLabel')}
                    </p>
                </GooglePicker>
                <DropboxChooser
                    styleName="add-lead-btn"
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
                        {this.props.leadsStrings('dropboxLabel')}
                    </p>
                </DropboxChooser>
                <FileInput
                    styleName="add-lead-btn"
                    onChange={this.handleLeadAddFromDisk}
                    showStatus={false}
                    multiple
                    accept=".pdf, .ppt, .pptx, .csv, .xls, .xlsx, .doc, .docx, .odt, .rtf, image/*"
                >
                    <span className={iconNames.upload} />
                    <p>
                        {this.props.leadsStrings('localDiskLabel')}
                    </p>
                </FileInput>
                <Button
                    styleName="add-lead-btn"
                    transparent
                    onClick={this.handleLeadAddFromWebsite}
                >
                    <span className={iconNames.globe} />
                    <p>
                        {this.props.leadsStrings('websiteLabel')}
                    </p>
                </Button>
                <Button
                    styleName="add-lead-btn"
                    transparent
                    onClick={this.handleLeadAddFromText}
                >
                    <span className={iconNames.clipboard} />
                    <p>
                        {this.props.leadsStrings('textLabel')}
                    </p>
                </Button>
            </div>
        );
    }
}
