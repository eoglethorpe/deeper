import Uploader, { UploadCoordinator } from '../../../../public/utils/Uploader';

import {
    urlForUpload,
    createHeaderForFileUpload,
} from '../../../../common/rest';

export default class AddLeadHandler {
    constructor(parent) {
        this.parent = parent;
        this.uploadCoordinator = new UploadCoordinator();
        this.counter = 1;
    }

    fromGoogleDrive = (response) => {
        const newLeads = [
            ...this.parent.state.leads,
        ];

        if (response.action !== 'picked') {
            return newLeads;
        }

        const {
            activeProject,
        } = this.parent.props;

        const {
            docs,
        } = response;

        for (let i = 0; i < docs.length; i += 1) {
            const leadId = `lead-${this.counter + i}`;

            const lead = {
                data: {
                    id: leadId,
                    type: 'drive',
                },
                form: {
                    values: {
                        title: docs[i].name,
                        project: activeProject,
                    },
                    errors: [],
                    fieldErrors: {},
                },
                uiState: {
                    error: false,
                    pending: false,
                    ready: false,
                    stale: false,
                },

                // has passed filter
                isFiltrate: true,
            };

            newLeads.push(lead);
        }


        this.counter += docs.length;
        return newLeads;
    }

    fromDropbox = (response) => {
        const newLeads = [
            ...this.parent.state.leads,
        ];

        const {
            activeProject,
        } = this.parent.props;

        for (let i = 0; i < response.length; i += 1) {
            const leadId = `lead-${this.counter + i}`;

            const lead = {
                data: {
                    id: leadId,
                    type: 'dropbox',
                },
                form: {
                    values: {
                        title: response[i].name,
                        project: activeProject,
                    },
                    errors: [],
                    fieldErrors: {},
                },
                uiState: {
                    error: false,
                    pending: false,
                    ready: false,
                    stale: false,
                },

                // has passed filter
                isFiltrate: true,
            };

            newLeads.push(lead);
        }


        this.counter += response.length;
        return newLeads;
    }

    fromDisk = (e) => {
        const {
            activeProject,
        } = this.parent.props;

        const newLeads = [
            ...this.parent.state.leads,
        ];

        const files = Object.values(e);

        for (let i = 0; i < files.length; i += 1) {
            const leadId = `lead-${this.counter + i}`;

            const uploader = new Uploader(
                files[i],
                urlForUpload,
                createHeaderForFileUpload(this.parent.props.token),
            );

            uploader.onLoad = (status, response) => {
                this.parent.handleUploadComplete(leadId, leadId, status, response);
            };

            uploader.onProgress = (progress) => {
                this.parent.handleLeadUploadProgress(leadId, progress);
            };

            this.uploadCoordinator.add(leadId, uploader);

            const lead = {
                data: {
                    id: leadId,
                    type: 'file',
                },
                form: {
                    values: {
                        title: files[i].name,
                        project: activeProject,
                    },
                    errors: [],
                    fieldErrors: {},
                },
                uiState: {
                    error: false,
                    pending: false,
                    ready: false,
                    stale: false,
                },
                upload: {
                    progress: 0,
                    uploader,
                },

                // has passed filter
                isFiltrate: true,
            };

            newLeads.push(lead);
        }

        this.uploadCoordinator.queueAll();
        this.counter += files.length;

        return newLeads;
    }

    fromWebsite = () => {
        const newLeads = [
            ...this.parent.state.leads,
            {
                data: {
                    id: `lead-${this.counter}`,
                    type: 'website',
                },
                form: {
                    values: {
                        title: `Lead #${this.counter}`,
                        project: this.parent.props.activeProject,
                    },
                    errors: [],
                    fieldErrors: {},
                },
                uiState: {
                    error: false,
                    pending: false,
                    ready: false,
                    stale: false,
                },

                // has passed filter
                isFiltrate: true,
            },
        ];

        this.counter += 1;
        return newLeads;
    }

    fromText = () => {
        const newLeads = [
            ...this.parent.state.leads,
            {
                data: {
                    id: `lead-${this.counter}`,
                    type: 'text',
                },
                form: {
                    values: {
                        title: `Lead #${this.counter}`,
                        project: this.parent.props.activeProject,
                    },
                    errors: [],
                    fieldErrors: {},
                },
                uiState: {
                    error: false,
                    pending: false,
                    ready: false,
                    stale: false,
                },

                // has passed filter
                isFiltrate: true,
            },
        ];

        this.counter += 1;
        return newLeads;
    }
}
