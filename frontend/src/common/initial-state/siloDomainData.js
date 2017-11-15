const initialSiloDomainData = {
    activeProject: 1,
    activeCountry: undefined,

    addLeadView: {
        filters: {
            search: '',
            type: [],
            source: '',
            status: '',
        },
        leads: [
            /*
            {
                serverId: undefined,
                data: {
                    id: 'lead-1',
                    type: 'text', // dropbox, file, website, text
                },
                form: {
                    values: {
                        title: 'Lead #1',
                        source: 'TV',
                        project: 1,
                    },
                    errors: [],
                    fieldErrors: {
                        title: 'Title is not defined',
                    },
                },
                uiState: {
                    error: true,
                    pending: false,
                    ready: true,
                    stale: false,
                },
                // upload: {
                //    progress: 0,
                //    uploader: UploaderObject,
                // }
                isFiltrate: true, // to show or not to show
            },
            {
                serverId: undefined,
                data: {
                    id: 'lead-2',
                    type: 'website', // dropbox, file, website, text
                },
                form: {
                    values: {
                        title: 'Lead #2',
                        project: 2,
                        source: 'Internet',
                    },
                    errors: [],
                    fieldErrors: {},
                },
                uiState: {
                    error: false,
                    pending: false,
                    ready: true,
                    stale: false,
                },
                isFiltrate: true, // to show or not to show
            },
            */
        ],
        activeLeadId: 'lead-1',
    },

};

export default initialSiloDomainData;
