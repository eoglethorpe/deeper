const pathNames = {
    login: '/login/',
    register: '/register/',
    passwordReset: '/password-reset/',
    browserExtension: '/browser-extension/',

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

    analysisFramework: '/analysis-framework/:analysisFrameworkId/',

    categoryEditor: '/category-editor/:categoryEditorId/',

    weeklySnapshot: '/weekly-snapshot/',

    apiDocs: '/api-docs/',

    userExports: '/projects/:projectId/exports/',

    homeScreen: '/',

    fourHundredFour: undefined,
};

export default pathNames;
