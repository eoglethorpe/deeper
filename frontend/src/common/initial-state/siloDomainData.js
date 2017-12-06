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

    // lead page for project i
    leadPage: {
        /*
        1: {
            activeSort: '-created_at',
            activePage: 1,
            filters: {},
            leads: [],
            totalLeadsCount: {},
        },
        */
    },

    editEntryView: {
        lead: {},
    },

    analysisFrameworkView: {
        analysisFramework: {
            /*
            id: 1,
            title: 'ACAPS Framework',
            createdAt: '',
            modifiedAt: '',
            createdBy: 1,
            modifiedBy: 1,

            widgets: [
                {
                    id: 1,
                    widgetId: 'excerpt-1xs',
                    title: 'Excerpt',
                    properties: {},
                }
            ],

            filters: [
            ],
            exportables: [
            ],
            */
        },
    },
};

export default initialSiloDomainData;
