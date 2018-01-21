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
    userExports: lp,

    adminPanel: la,
    projectSelect: l,
};

const allLinksWithProjectDisabled = {
    ...allLinks,
    projectSelect: { ...l, disable: true },
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
    browserExtension: allLinksWithProjectDisabled,

    homeScreen: allLinks,

    dashboard: allLinks,

    leads: allLinks,
    leadsViz: allLinks,
    addLeads: allLinksWithProjectDisabled,

    entries: allLinks,
    editEntries: allLinksWithProjectDisabled,

    ary: allLinks,
    editAry: allLinksWithProjectDisabled,

    export: allLinks,

    userProfile: allLinksWithProjectDisabled,
    userGroup: allLinksWithProjectDisabled,

    projects: allLinks,
    countries: allLinksWithProjectDisabled,

    analysisFramework: allLinksWithProjectDisabled,

    categoryEditor: allLinksWithProjectDisabled,

    weeklySnapshot: allLinksWithProjectDisabled,

    apiDocs: allLinksWithProjectDisabled,

    userExports: allLinks,
};

export default validLinks;
