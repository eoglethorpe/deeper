/*
    this.uploadCoordinator = new UploadCoordinator();
    // TRANSIENT DATA
    for (let i = 0; i < files.length; i += 1) {
        const leadId = `lead-${this.counter + i}`;
        const uploader = new Uploader(
            files[i],
            urlForUpload,
            createHeaderForFileUpload(this.props.token),
        );
        uploader.onLoad = (status, response) => {
            this.handleUploadComplete(leadId, leadId, status, response);
        };
        uploader.onProgress = (progress) => {
            this.handleLeadUploadProgress(leadId, progress);
        };
        this.uploadCoordinator.add(leadId, uploader);
    }
    this.uploadCoordinator.queueAll();
    this.counter += files.length;
*/


/*
    import Uploader, { UploadCoordinator } from '../../../../public/utils/Uploader';
    import {
        urlForUpload,
        createHeaderForFileUpload,
    } from '../../../../common/rest';
*/

    /*
    handleLeadUploadProgress = (leadId, progress) => {
        const { leads } = this.state;
        const leadIndex = leads.findIndex(d => d.data.id === leadId);
        const settings = {
            [leadIndex]: {
                upload: {
                    progress: {
                        $set: progress,
                    },
                },
            },
        };
        const newLeads = update(leads, settings);
        this.setState({
            leads: newLeads,
        });
    }

    handleUploadComplete = (uploaderId, leadId, status, response) => {
        const { leads } = this.state;
        const leadIndex = leads.findIndex(d => d.data.id === leadId);
        const r = JSON.parse(response);

        if (parseInt(status / 100, 10) === 2) {
            // success (eg: 200, 201)
            const settings = {
                [leadIndex]: {
                    upload: {
                        $merge: {
                            progress: 100,
                            serverId: r.id,
                            title: r.title,
                            error: undefined,
                        },
                    },
                    form: {
                        error: { $set: [] },
                    },
                    uiState: {
                        error: { $set: false },
                    },
                },
            };
            const newLeads = update(leads, settings);
            this.setState({
                leads: newLeads,
            });
        } else {
            const settings = {
                [leadIndex]: {
                    upload: {
                        $merge: {
                            progress: 0,
                            error: `Failed to upload file (${status})`,
                        },
                    },
                    form: {
                        error: {
                            $set: [`Failed to upload file (${status})`],
                        },
                    },
                    uiState: {
                        error: { $set: true },
                    },
                },
            };

            const newLeads = update(leads, settings);
            this.setState({
                leads: this.applyFiltersFromState(newLeads),
            });
        }
    }
*/

/*
handleLeadUploadProgress = (leadId, progress) => {
    const { leads } = this.state;
    const leadIndex = leads.findIndex(d => d.data.id === leadId);
    const settings = {
        [leadIndex]: {
            upload: {
                progress: {
                    $set: progress,
                },
            },
        },
    };
    const newLeads = update(leads, settings);
    this.setState({
        leads: newLeads,
    });
}

handleUploadComplete = (uploaderId, leadId, status, response) => {
    const { leads } = this.state;
    const leadIndex = leads.findIndex(d => d.data.id === leadId);
    const r = JSON.parse(response);

    if (parseInt(status / 100, 10) === 2) {
        // success (eg: 200, 201)
        const settings = {
            [leadIndex]: {
                upload: {
                    $merge: {
                        progress: 100,
                        serverId: r.id,
                        title: r.title,
                        error: undefined,
                    },
                },
                form: {
                    error: { $set: [] },
                },
                uiState: {
                    error: { $set: false },
                },
            },
        };
        const newLeads = update(leads, settings);
        this.setState({
            leads: newLeads,
        });
    } else {
        const settings = {
            [leadIndex]: {
                upload: {
                    $merge: {
                        progress: 0,
                        error: `Failed to upload file (${status})`,
                    },
                },
                form: {
                    error: {
                        $set: [`Failed to upload file (${status})`],
                    },
                },
                uiState: {
                    error: { $set: true },
                },
            },
        };

        const newLeads = update(leads, settings);
        this.setState({
            leads: this.applyFiltersFromState(newLeads),
        });
    }
}
*/
