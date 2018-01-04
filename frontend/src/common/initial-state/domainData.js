const initialDomainDataState = {

    // index is project id
    projects: {
        /*
        1: {
        },
        */
    },

    // index is userGroup id
    userGroups: {
        /*
        1: {
            id: 1,
            title: 'Togglecorp',
            rights: 'Admin',
            createdAt: '2017-10-26T04:47:12.381611Z',
            joinedAt: '2017-10-26T04:47:12.381611Z',
            memberships: [],
        },
        */
    },

    categoryEditors: {
        /*
        1: {
            id: 1,
            title: 'Category Editor',
            createdAt: '',
            modifiedAt: '',
            createdBy: 1,
            modifiedBy: 1,
        },
        */
    },

    analysisFrameworks: {
        /*
        1: {
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
        },
        */
    },

    // index is project id
    leadFilterOptions: {
        /*
        1: {
        },
        */
    },

    // index is project id
    projectsOptions: {
        /*
        1: {
        },
        */
    },

    users: {
        /*
        1: {
            information: {
                id: 14,
                username: 'hari@hari.com',
                email: 'hari@hari.com',
                firstName: 'hari',
                lastName: 'hari',
                displayName: 'hari',
                displayPicture: null,
                organization: 'hari',
            },
            projects: [
            ],
            userGroups: [1, 2],
        },
        */
    },

    regions: {
        /*
        1: { id: 1, fullName: 'American Samoa', iso: 'ASM', countryId: 'ASM' },
        */
    },

    adminLevels: {
        // index is project id
        /*
        1: [
            {
                adminLevelId: 1,
                level: 1,
                name: 'Country',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 2,
                level: 2,
                name: 'Zone',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 3,
                level: 3,
                name: 'District',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 4,
                level: 4,
                name: 'GABISA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 5,
                level: 5,
                name: 'HABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 6,
                level: 6,
                name: 'ABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 7,
                level: 7,
                name: 'HABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
        ],
        */
    },

    visualization: {
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
                'Public Health', 'Refugees', 'Condition', 'Migration', 'Trafficking', 'Deforestation', 'Global Warming',
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
    },
};
export default initialDomainDataState;
