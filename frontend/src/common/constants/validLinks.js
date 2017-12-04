const allLinks = [
    'login',
    'register',
    'homeScreen',
    'dashboard',
    'leads',
    'addLeads',
    'entries',
    'editEntries',
    'ary',
    'editAry',
    'export',
    'userProfile',
    'userGroup',
    'projects',
    'countries',
    'adminPanel',
    'analysisFramework',
    'categoryEditor',
    'weeklySnapshot',
    'apiDocs',
    'fourHundredFour',
];

const blacklistLinks = (links, blacklist) => {
    const newLinks = [...links];

    blacklist.forEach((link) => {
        const linkIndex = newLinks.findIndex(d => d === link);

        if (linkIndex !== -1) {
            newLinks.splice(linkIndex, 1);
        }
    });

    return newLinks;
};

const validLinks = {
    login: [],
    register: [],

    homeScreen: allLinks,

    dashboard: blacklistLinks(allLinks, ['entries']),

    leads: allLinks,
    addLeads: allLinks,

    entries: allLinks,
    editEntries: allLinks,

    ary: allLinks,
    editAry: allLinks,

    export: allLinks,

    userProfile: allLinks,
    userGroup: allLinks,

    projects: allLinks,
    countries: allLinks,

    adminPanel: allLinks,

    analysisFramework: allLinks,

    categoryEditor: allLinks,

    weeklySnapshot: allLinks,

    apiDocs: allLinks,

    fourHundredFour: [],
};

export default validLinks;
