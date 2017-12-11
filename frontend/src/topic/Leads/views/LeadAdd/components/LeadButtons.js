/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { TransparentButton } from '../../../../../public/components/Action';
import { FileInput } from '../../../../../public/components/Input';
import { randomString } from '../../../../../public/utils/common';

import {
    addLeadViewAddLeadsAction,
    activeProjectSelector,
} from '../../../../../common/redux';
import DropboxChooser from '../../../../../common/components/DropboxChooser';
import GooglePicker from '../../../../../common/components/GooglePicker';
import { dropboxAppKey } from '../../../../../common/config/dropbox';
import {
    googleDriveClientId,
    googleDriveDeveloperKey,
} from '../../../../../common/config/google-drive';

import { LEAD_TYPE } from '../utils/constants';
import styles from '../styles.scss';

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
    activeProject: activeProjectSelector(state),
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
        this.state = { dropboxDisabled: false };
    }

    handleAddLeadFromGoogleDrive = (response) => {
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
                type: LEAD_TYPE.drive,

                values: {
                    title: doc.name,
                    project: activeProject,
                },

                stale: false,
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

    handleAddLeadFromDropbox = (response) => {
        if (response.length <= 0) {
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
                type: LEAD_TYPE.dropbox,

                values: {
                    title: doc.name,
                    project: activeProject,
                },

                stale: false,
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

    handleAddLeadFromDisk = (e) => {
        const files = Object.values(e);
        if (files.length <= 0) {
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
                type: LEAD_TYPE.file,

                values: {
                    title: file.name,
                    project: activeProject,
                },

                stale: false,
            });

            uploads.unshift({
                file,
                leadId: newLeadId,
            });
        });

        this.props.addLeads(newLeads);

        const { onFileSelect } = this.props;
        onFileSelect(uploads);
    }

    handleAddLeadFromWebsite = () => {
        const { activeProject } = this.props;
        const newLeads = [];

        const uid = randomString();
        const newLeadId = `lead-${uid}`;

        newLeads.unshift({
            id: newLeadId,
            type: LEAD_TYPE.website,

            values: {
                title: `Lead ${(new Date()).toLocaleTimeString()}`,
                project: activeProject,
            },

            stale: false,
        });

        this.props.addLeads(newLeads);
    }

    handleAddLeadFromText = () => {
        const { activeProject } = this.props;
        const newLeads = [];

        const uid = randomString();
        const newLeadId = `lead-${uid}`;

        newLeads.unshift({
            id: newLeadId,
            type: LEAD_TYPE.text,

            values: {
                title: `Lead ${(new Date()).toLocaleTimeString()}`,
                project: activeProject,
            },

            stale: false,
        });

        this.props.addLeads(newLeads);
    }

    handleGoogleDriveOnAuthenticated = (accessToken) => {
        // TODO: use this token will uploading
        console.warn(accessToken);
        if (accessToken) {
            this.googleDriveAccessToken = accessToken;
        }
    }

    handleDropboxChooserClick = () => this.setState({ dropboxDisabled: true });

    handleDropboxChooserCancel = () => this.setState({ dropboxDisabled: false });

    render() {
        const {
            dropboxDisabled,
        } = this.state;

        return (
            <div styleName="add-lead-buttons">
                <h3 styleName="heading">
                    Add new lead from:
                </h3>
                <GooglePicker
                    styleName="add-lead-btn"
                    clientId={googleDriveClientId}
                    developerKey={googleDriveDeveloperKey}
                    onAuthenticate={this.handleGoogleDriveOnAuthenticated}
                    onChange={this.handleAddLeadFromGoogleDrive}
                    mimeTypes={supportedGoogleDriveMimeTypes}
                    multiselect
                    navHidden
                >
                    <span className="ion-social-googleplus-outline" />
                    <p>Drive</p>
                </GooglePicker>
                <DropboxChooser
                    styleName="add-lead-btn"
                    appKey={dropboxAppKey}
                    multiselect
                    extensions={supportedDropboxExtension}
                    success={this.handleAddLeadFromDropbox}
                    onClick={this.handleDropboxChooserClick}
                    cancel={this.handleDropboxChooserCancel}
                    disabled={dropboxDisabled}
                >
                    <span className="ion-social-dropbox" />
                    <p>Dropbox</p>
                </DropboxChooser>
                <FileInput
                    styleName="add-lead-btn"
                    onChange={this.handleAddLeadFromDisk}
                    showStatus={false}
                    multiple
                >
                    <span className="ion-android-upload" />
                    <p>Local disk</p>
                </FileInput>
                <TransparentButton
                    styleName="add-lead-btn"
                    onClick={this.handleAddLeadFromWebsite}
                >
                    <span className="ion-earth" />
                    <p>Website</p>
                </TransparentButton>
                <TransparentButton
                    styleName="add-lead-btn"
                    onClick={this.handleAddLeadFromText}
                >
                    <span className="ion-clipboard" />
                    <p>Text</p>
                </TransparentButton>
            </div>
        );
    }
}
