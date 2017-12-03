const pathNames = {
    login: '/login/',
    register: '/register/',

    homeScreen: '/',

    dashboard: '/projects/:projectId/dashboard/',

    leads: '/projects/:projectId/leads/',
    addLeads: '/projects/:projectId/leads/add/',

    entries: '/projects/:projectId/entries/',
    editEntries: '/projects/:projectId/leads/:leadId/edit-entries/',

    ary: '/projects/:projectId/ary/',
    editAry: '/projects/:projectId/leads/:leadId/edit-ary/',

    export: '/projects/:projectId/export/',


    userProfile: '/user/:userId/',
    userGroup: '/user-group/:userGroupId/',

    projects: '/projects/:projectId?/',
    countries: '/countries/:countryId?/',

    adminPanel: '/admin/',

    analysisFramework: '/analysis-framework/:analysisFrameworkId/',

    categoryEditor: '/category-editor/',

    weeklySnapshot: '/weekly-snapshot/',

    apiDocs: '/api-docs/',

    fourHundredFour: '/404/',
};

export default pathNames;
