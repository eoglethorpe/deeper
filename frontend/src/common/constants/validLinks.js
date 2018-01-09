// eslint-disable-next-line no-unused-vars
const lap = { requireLogin: true, requireAdminRights: true, requireProject: true };
const la = { requireLogin: true, requireAdminRights: true };
const lp = { requireLogin: true, requireProject: true };
const l = { requireLogin: true };
// eslint-disable-next-line no-unused-vars
const x = { requireLogin: false };

const noLinks = {};
const allLinks = {
    leads: lp,
    entries: lp,
    ary: lp,
    projects: l,
    countries: l,
    export: lp,

    userProfile: l,
    apiDocs: l,

    adminPanel: la,
    projectSelect: l,
};

// eslint-disable-next-line no-unused-vars
const blacklistLinks = (links, blacklist) => {
    const newLinks = { ...links };
    blacklist.forEach((link) => {
        newLinks[link] = undefined;
    });
    return newLinks;
};

const validLinks = {
    login: noLinks,
    register: noLinks,
    passwordReset: noLinks,
    fourHundredFour: noLinks,

    homeScreen: allLinks,

    dashboard: allLinks,

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

    analysisFramework: allLinks,

    categoryEditor: allLinks,

    weeklySnapshot: allLinks,

    apiDocs: allLinks,
};

export default validLinks;
