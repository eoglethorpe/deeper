const pathNames = {
    login: '/login/',
    register: '/register/',

    projects: '/projects/:projectId?/',
    dashboard: '/projects/:projectId/dashboard/',

    leads: '/projects/:projectId/leads/',
    addLeads: '/projects/:projectId/leads/add/',

    entries: '/projects/:projectId/entries/',
    editEntries: '/projects/:projectId/leads/:leadId/edit-entries/',

    ary: '/projects/:projectId/ary/',
    // editAry: '/projects/:projectId/leads/:leadId/edit-ary/',

    export: '/projects/:projectId/export/',

    countries: '/countries/:countryId?/',

    userProfile: '/user/:userId/',
    userGroup: '/user-group/:userGroupId/',

    adminPanel: '/admin/',

    analysisFramework: '/analysis-framework/:analysisFrameworkId/',

    categoryEditor: '/category-editor/',

    weeklySnapshot: '/weekly-snapshot/',

    apiDocs: '/api-docs/',

    homeScreen: '/',

    fourHundredFour: undefined,
};

export default pathNames;
