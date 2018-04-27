export const mapObjectToObject = (obj, fn) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        newObj[key] = fn(obj[key], key);
    });
    return newObj;
};

export const mapObjectToArray = (obj, fn) => {
    const newArray = [];
    Object.keys(obj).forEach((key) => {
        const value = fn(obj[key], key);
        newArray.push(value);
    });
    return newArray;
};

const prepareSettings = (semantics) => {
    const mapCharacterToSettingMap = {
        x: { name: 'requireLogin', value: false },
        l: { name: 'requireLogin', value: true },
        a: { name: 'requireAdminRights', value: true },
        p: { name: 'requireProject', value: true },
        d: { name: 'requireDevMode', value: true },
        A: { name: 'requireAssessmentTemplate', value: true },
        D: { name: 'disable', value: true },
    };
    const settings = {
        requireDevMode: false,
        requireLogin: false,
        requireAdminRights: false,
        requireAssessmentTemplate: false,
        disable: false,
    };
    semantics.split(',').forEach((character) => {
        const characterSetting = mapCharacterToSettingMap[character];
        if (characterSetting) {
            const { name, value } = characterSetting;
            settings[name] = value;
        }
    });
    return settings;
};

const commonLinks = {
    leads: 'l,p',
    entries: 'l,p',
    arys: 'l,p,A',
    projects: 'l',
    connectors: 'l,d',
    countries: 'l',
    export: 'l,p',

    userProfile: 'l',
    apiDocs: 'l,d',
    userExports: 'l,p',

    adminPanel: 'l,a',
    stringManagement: 'l,a,d',
};

export const noLinks = {};
export const allLinks = mapObjectToObject(
    {
        ...commonLinks,
        projectSelect: 'l',
    },
    prepareSettings,
);
export const allLinksWithProjectDisabled = mapObjectToObject(
    {
        ...commonLinks,
        projectSelect: 'l,D',
    },
    prepareSettings,
);
