// eslint-disable-next-line no-unused-vars
const blacklistLinks = (links, blacklist) => {
    const newLinks = { ...links };
    blacklist.forEach((link) => {
        newLinks[link] = undefined;
    });
    return newLinks;
};

// LINK TYPE

// eslint-disable-next-line no-unused-vars
const lap = { requireLogin: true, requireAdminRights: true, requireProject: true };
const la = { requireLogin: true, requireAdminRights: true };
const lp = { requireLogin: true, requireProject: true };
const l = { requireLogin: true };
const x = { requireLogin: false };

// eslint-disable-next-line no-unused-vars
const lapd = { ...lap, requireDevMode: true };
const lad = { ...la, requireDevMode: true };
const lpd = { ...lp, requireDevMode: true };
const ld = { ...l, requireDevMode: true };
// eslint-disable-next-line no-unused-vars
const xd = { ...x, requireDevMode: true };

// COMMON LINK COMBINATION

const noLinks = {};

const allLinks = {
    leads: lp,
    entries: lp,
    ary: lpd,
    projects: l,
    countries: l,
    export: lp,

    userProfile: l,
    apiDocs: ld,
    userExports: lp,

    adminPanel: la,
    stringManagement: lad,

    projectSelect: l,
};

const allLinksWithProjectDisabled = {
    ...allLinks,
    projectSelect: { ...l, disable: true },
};

// LINKS IN PAGES

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
    stringManagement: allLinksWithProjectDisabled,
};

export default validLinks;
