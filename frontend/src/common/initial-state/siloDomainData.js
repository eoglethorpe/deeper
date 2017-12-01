const initialSiloDomainData = {
    activeProject: undefined,
    activeCountry: undefined,

    addLeadView: {
        filters: {
            search: '',
            type: [],
            source: '',
            status: '',
        },
        activeLeadId: 'lead-1',
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
                    stale: false,
                },
            },
            */
        ],
    },

    // i specifies project
    leadPage: {
        /*
        1: {
            activeSort: '-created_at',
            activePage: 1,
            filters: {
            },
            leads: [],
            totalLeadsCount: 123,
        },
        */
    },

    // i specifies lead
    editEntryView: {
        /*
        1: {
            leadId: 1,
            lead: {},
            selectedEntryId: undefined,
            entries: [],
        },
        */
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

    categoryEditorView: {
        selectedCategoryId: 1,
        selectedSubCategoryId: 1,
        selectedSubSubCategoryId: 1,
    },
};

export default initialSiloDomainData;
