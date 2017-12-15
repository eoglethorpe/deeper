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
import {
    sources,
    iconNames,
} from '../../../../../common/constants';

import { LEAD_TYPE } from '../../../../../common/entities/lead';
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

    handleAddLeadFromDropbox = (response) => {
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
                type: LEAD_TYPE.dropbox,

                values: {
                    title: doc.name,
                    project: activeProject,
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

            pristine: false,
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

            pristine: false,
        });

        this.props.addLeads(newLeads);
    }

    handleGoogleDriveOnAuthenticated = (accessToken) => {
        if (accessToken) {
            // NOTE: use this token later during upload
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
                    {sources.addSourceFromLabel}
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
                    <span className={iconNames.googleDrive} />
                    <p>{sources.googleDriveLabel}</p>
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
                    <span className={iconNames.dropbox} />
                    <p>{sources.dropboxLabel}</p>
                </DropboxChooser>
                <FileInput
                    styleName="add-lead-btn"
                    onChange={this.handleAddLeadFromDisk}
                    showStatus={false}
                    multiple
                >
                    <span className={iconNames.upload} />
                    <p>{sources.localDiskLabel}</p>
                </FileInput>
                <TransparentButton
                    styleName="add-lead-btn"
                    onClick={this.handleAddLeadFromWebsite}
                >
                    <span className={iconNames.globe} />
                    <p>{sources.websiteLabel}</p>
                </TransparentButton>
                <TransparentButton
                    styleName="add-lead-btn"
                    onClick={this.handleAddLeadFromText}
                >
                    <span className={iconNames.clipboard} />
                    <p>{sources.textLabel}</p>
                </TransparentButton>
            </div>
        );
    }
}
