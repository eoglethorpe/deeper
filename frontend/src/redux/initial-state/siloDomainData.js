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
                id: 'lead-1',
                serverId: undefined,
                faramValues: {
                    title: 'Lead #1',
                    source: 'TV',
                    project: 1,
                },
                faramErrors: {
                    title: 'Title is not defined',
                },
                uiState: {
                    error: true,
                    pristine: false,
                },
            },
            */
        ],
        /*
        leadRests: {},
        leadUploads: {},
        leadDriveRests: {},
        leadDropboxRests: {},
        */
        connectorsList: {
            /*
            1: {
                1: {
                    id: 1,
                    source: 'rss-feed',
                    title: 'Gotham City in Bulbasaur',
                },
                2: {
                    id: 2,
                    source: 'rss-feed',
                    title: 'Daily Bugle',
                },
            },
            2: {
                1: {
                    id: 1,
                    source: 'rss-feed',
                    title: 'Gotham City',
                },
                2: {
                    id: 2,
                    source: 'rss-feed',
                    title: 'Daily Bugle',
                },
            },
            */
        },
    },

    // i specifies project
    leadPage: {
        /*
        1: {
            activeSort: '-created_at',
            activePage: 1,
            viewMode: 'viz',
            filters: {
            },
            leads: [],
            totalLeadsCount: 123,
        },
        */
    },

    // i specifies project
    aryPage: {
        /*
        1: {
            activeSort: '-created_at',
            activePage: 1,
            filters: {},
            arys: [],
            totalArysCount: 123,
        },
        */
    },

    entriesView: {
        /*
        1: {
            activeSort: '-created_at',
            activePage: 1,
            filters: { },
            entries: [],
            totalEntriesCount: 123,
        },
        */
    },

    // i specifies lead
    editEntry: {
        /*
        1: {
            leadId: 1,
            lead: {},
            selectedEntryId: undefined,
            entries: [
            ],
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

    // SubCategory = {
    //     id: <string>,
    //     title: <string>,
    //     subCategories: <SubCategory>[],
    // }
    categoryEditorView: {
        /*
        1: {
            title: '',
            versionId: 0,
            data: {
                activeCategoryId: undefined,
                categories: [
                    // {
                    //     id: <string>,
                    //     title: <string>,
                    //     selectedSubCategorie: <string>[] : SubCategory.id,
                    //     subCategories: <SubCategory>[],
                    // }
                ],
            },
        },
        */
    },

    categoryEditorDocument: {
        // index is category editor id
        1: {
            documents: [],
            previewId: undefined,
            extractedWords: {
                // index is n-gram
                '1grams': [],
                '2grams': [],
                '3grams': [],
            },
        },
    },

    editAry: {
        /*
        1: {
            // index is lead id
        },
        */
    },

    userGalleryFiles: [],

    visualization: {
        // index is project id
        4: {
            pristine: true,
            hierarchialData: {
                name: 'TOPICS',
                children: [{
                    name: 'Health',
                    children: [{
                        name: 'Population',
                        size: 4,
                    }, {
                        name: 'Diseases',
                        size: 4,
                    }],
                }, {
                    name: 'Crisis',
                    children: [{
                        name: 'Hunger',
                        size: 3,
                    }, {
                        name: 'Famine',
                        size: 3,
                    }, {
                        name: 'Death',
                        size: 3,
                    }],
                }, {
                    name: 'Refugees',
                    children: [{
                        name: 'Migration',
                        size: 4,
                    }, {
                        name: 'Trafficking',
                        size: 4,
                    }],
                }, {
                    name: 'Disasters',
                    children: [{
                        name: 'Earthquake',
                        size: 4,
                    }, {
                        name: 'Landslide',
                        size: 4,
                    }, {
                        name: 'Wildfire',
                        size: 4,
                    }],
                }, {
                    name: 'Environment',
                    children: [{
                        name: 'Deforestation',
                        size: 4,
                    }, {
                        name: 'Pollution',
                        size: 4,
                    }, {
                        name: 'Global warming',
                        size: 4,
                    }, {
                        name: 'Public health',
                        size: 4,
                    }],
                }],
            },
            correlationData: {
                labels: ['Pollution', 'Environment', 'Disasters', 'Refugees', 'Crisis', 'Health'],
                values: [
                    [1.000000, -0.852162, -0.847551, -0.776168, 0.681172, -0.867659],
                    [-0.852162, 1.000000, 0.902033, 0.832447, -0.699938, 0.782496],
                    [-0.847551, 0.902033, 1.000000, 0.790949, -0.710214, 0.887980],
                    [-0.776168, 0.832447, 0.790949, 1.000000, -0.448759, 0.658748],
                    [0.681172, -0.699938, -0.710214, -0.448759, 1.000000, -0.712441],
                    [-0.867659, 0.782496, 0.887980, 0.658748, -0.712441, 1.000000],
                ],
            },
            chordData: {
                labels: [
                    'Health', 'Pollution', 'Pollution', 'Disasters', 'Crisis', 'Environment',
                    'Public Health', 'Refugees', 'Condition', 'Migration', 'Trafficking',
                    'Deforestation', 'Global Warming',
                    'Diseases', 'Resettlement', 'Immigrants', 'Nutrition',
                ],
                values: [
                    [2, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
                    [0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                    [1, 0, 0, 1, 0, 0, 4, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                    [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                    [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 9, 0, 0, 1, 1, 0, 1, 1, 0],
                    [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
                    [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 7, 1, 0, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                    [0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                    [0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
                ],
            },
            barData: {
                data: [
                    { label: 'Health', value: 19 },
                    { label: 'Pollution', value: 5 },
                    { label: 'Disasters', value: 13 },
                    { label: 'Refugees', value: 17 },
                    { label: 'Crisis', value: 19 },
                    { label: 'Environment', value: 27 },
                ],
            },
            forceDirectedData: {
                nodes: [
                    { id: 'Health', group: 1 },
                    { id: 'Crisis', group: 2 },
                    { id: 'Refugees', group: 3 },
                    { id: 'Disasters', group: 4 },
                    { id: 'Environment', group: 5 },
                    { id: 'Population', group: 7 },
                    { id: 'Diseases', group: 1 },
                    { id: 'Nutrition', group: 1 },
                    { id: 'Environment', group: 1 },
                    { id: 'Hunger', group: 2 },
                    { id: 'Famine', group: 2 },
                    { id: 'Death', group: 2 },
                    { id: 'Global Warming', group: 2 },
                    { id: 'Migration', group: 3 },
                    { id: 'Trafficking', group: 3 },
                    { id: 'Language', group: 3 },
                    { id: 'Cultural', group: 3 },
                    { id: 'Resettlement', group: 3 },
                    { id: 'Social Service', group: 3 },
                    { id: 'State', group: 3 },
                    { id: 'Programs', group: 3 },
                    { id: 'Terrorism', group: 4 },
                    { id: 'Wildfires', group: 4 },
                    { id: 'Earthquake', group: 4 },
                    { id: 'Landslide', group: 4 },
                    { id: 'Floods', group: 4 },
                    { id: 'Hurricane', group: 4 },
                    { id: 'Tornado', group: 4 },
                    { id: 'Pollution', group: 5 },
                    { id: 'Global Warming', group: 5 },
                    { id: 'Public Health', group: 5 },
                    { id: 'Biogas', group: 5 },
                    { id: 'Carbon footprint', group: 5 },
                    { id: 'Drinking Water', group: 5 },
                    { id: 'Gasonline', group: 5 },
                ],
                links: [
                    { source: 'Health', target: 'Population', value: 4 },
                    { source: 'Health', target: 'Diseases', value: 4 },
                    { source: 'Health', target: 'Nutrition', value: 8 },
                    { source: 'Health', target: 'Environment', value: 8 },
                    { source: 'Crisis', target: 'Hunger', value: 4 },
                    { source: 'Crisis', target: 'Famine', value: 4 },
                    { source: 'Crisis', target: 'Death', value: 8 },
                    { source: 'Crisis', target: 'Environment', value: 8 },
                    { source: 'Crisis', target: 'Global Warming', value: 8 },
                    { source: 'Refugees', target: 'Migration', value: 4 },
                    { source: 'Refugees', target: 'Trafficking', value: 4 },
                    { source: 'Refugees', target: 'Language', value: 8 },
                    { source: 'Refugees', target: 'Cultural', value: 8 },
                    { source: 'Refugees', target: 'Resettlement', value: 8 },
                    { source: 'Refugees', target: 'Social Service', value: 8 },
                    { source: 'Refugees', target: 'State', value: 8 },
                    { source: 'Refugees', target: 'Programs', value: 8 },
                    { source: 'Disasters', target: 'Migration', value: 4 },
                    { source: 'Disasters', target: 'Terrorism', value: 4 },
                    { source: 'Disasters', target: 'Wildfires', value: 8 },
                    { source: 'Disasters', target: 'Earthquake', value: 8 },
                    { source: 'Disasters', target: 'Landslide', value: 8 },
                    { source: 'Disasters', target: 'Floods', value: 1 },
                    { source: 'Disasters', target: 'Hurricane', value: 2 },
                    { source: 'Disasters', target: 'Tornado', value: 4 },
                    { source: 'Environment', target: 'Pollution', value: 1 },
                    { source: 'Environment', target: 'Global Warming', value: 4 },
                    { source: 'Environment', target: 'Public Health', value: 4 },
                    { source: 'Environment', target: 'Biogas', value: 2 },
                    { source: 'Environment', target: 'Carbon footprint', value: 8 },
                    { source: 'Environment', target: 'Drinking Water', value: 2 },
                    { source: 'Environment', target: 'Gasonline', value: 8 },
                    { source: 'Health', target: 'Crisis', value: 8 },
                    { source: 'Health', target: 'Refugees', value: 8 },
                    { source: 'Health', target: 'Disasters', value: 8 },
                    { source: 'Health', target: 'Environment', value: 8 },
                    { source: 'Crisis', target: 'Refugees', value: 8 },
                    { source: 'Crisis', target: 'Disasters', value: 8 },
                    { source: 'Crisis', target: 'Environment', value: 8 },
                    { source: 'Refugees', target: 'Disasters', value: 8 },
                    { source: 'Refugees', target: 'Environment', value: 8 },
                ],
            },
            geoPointsData: {
                points: [
                    {
                        coordinates: [85.323960, 27.717245],
                        title: 'Kathmandu',
                        date: '2017-11-08',
                    },
                    {
                        coordinates: [10.76002, 34.739822],
                        title: 'Sfax',
                        date: '2012-10-08',
                    },
                    {
                        coordinates: [2.173403, 41.385064],
                        title: 'Barcelona',
                        date: '2016-03-08',
                    },
                    {
                        coordinates: [7.686856, 45.070312],
                        title: 'Turin',
                        date: '2017-05-08',
                    },
                    {
                        coordinates: [36.276528, 33.513807],
                        title: 'Damascus',
                        date: '2017-03-08',
                    },
                    {
                        coordinates: [37.13426, 36.202105],
                        title: 'Aleppo',
                        date: '2017-05-08',
                    },
                    {
                        coordinates: [31.235712, 30.044420],
                        title: 'Cairo',
                        date: '2017-07-08',
                    },
                    {
                        coordinates: [96.195132, 16.866069],
                        title: 'Yangon',
                        date: '2017-04-08',
                    },
                    {
                        coordinates: [104.892167, 11.544873],
                        title: 'Phnom Penh',
                        date: '2017-08-08',
                    },
                    {
                        coordinates: [85.0730032, 25.6080208],
                        title: 'Patna',
                        date: '2017-09-08',
                    },
                    {
                        coordinates: [79.8211861, 6.9218374],
                        title: 'Colombo',
                        date: '2017-07-08',
                    },
                    {
                        coordinates: [32.5025566, 15.5015341],
                        title: 'Khartoum',
                        date: '2017-08-08',
                    },
                    {
                        coordinates: [22.403526133, -5.897327],
                        title: 'Kananga',
                        date: '2017-03-08',
                    },
                    {
                        coordinates: [-43.5860656, -22.9140693],
                        title: 'Rio de Janeiro',
                        date: '2017-03-08',
                    },
                    {
                        coordinates: [-82.4030418, 23.0506712],
                        title: 'Havana',
                        date: '2017-12-08',
                    },
                    {
                        coordinates: [13.1708263, 32.8829357],
                        title: 'Tripoli',
                        date: '2018-01-08',
                    },
                ],
            },
        },
    },

    connectorsView: {
        // index is connector id
        /*
        list: {
            1: {
                id: 1,
                source: 'rss-feed',
                title: 'Gotham City',
            },
        },
        details: {
            1: {
                id: 1,
                source: 'rss-feed',
                hasErrors: false,
                faramValues: {
                    title: 'IRS reserve',
                    projects: [],
                    users: [],
                    params: {},
                },
                faramErrors: {},
                pristine: false,
            },
        },
        */
    },
    regions: {
        // index is regionId
        /*
        1: {
            formValues: {
                id: 1,
                code: 'NPL',
                title: 'Nepal',
                regionalGroups: {},
                keyFigures: {},
            },
            formErrors: {},
            formFieldErrors: {},
            pristine: false,
        },
        */
    },
};

export default initialSiloDomainData;
