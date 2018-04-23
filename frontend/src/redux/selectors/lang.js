import { createSelector } from 'reselect';
import stringFormat from 'string-format';

const emptyObject = {};

export const selectedLanguageNameSelector = ({ lang }) => (
    lang.selectedLanguage
);

const languagesSelector = ({ lang }) => (
    lang.languages || emptyObject
);

export const selectedLanguageSelector = createSelector(
    selectedLanguageNameSelector,
    languagesSelector,
    (selectedLanguage, languages) => languages[selectedLanguage] || emptyObject,
);

export const selectedRawStringsSelector = createSelector(
    selectedLanguageSelector,
    selectedLanguage => selectedLanguage.strings || emptyObject,
);

export const selectedViewStringsSelector = createSelector(
    selectedLanguageSelector,
    selectedLanguage => selectedLanguage.views || emptyObject,
);

const createSelectorForView = name => createSelector(
    selectedViewStringsSelector,
    selectedRawStringsSelector,
    (selectedViewStrings, selectedRawStrings) => (identifier, params) => {
        const namedViewStrings = selectedViewStrings[name] || emptyObject;
        const id = namedViewStrings[identifier];
        if (!id || !selectedRawStrings[id]) {
            console.warn(`String not found for ${name}:${identifier}`);
            return `{${name}:${identifier}}`;
        }
        if (params) {
            return stringFormat(selectedRawStrings[id], params);
        }
        return selectedRawStrings[id];
    },
);
export const afStringsSelector = createSelectorForView('af');
export const apiStringsSelector = createSelectorForView('api');
export const aryStringsSelector = createSelectorForView('ary');
export const ceStringsSelector = createSelectorForView('ce');
export const commonStringsSelector = createSelectorForView('common');
export const countriesStringsSelector = createSelectorForView('countries');
export const entryStringsSelector = createSelectorForView('entry');
export const exportStringsSelector = createSelectorForView('export');
export const fourHundredFourStringsSelector = createSelectorForView('fourHundredFour');
export const homescreenStringsSelector = createSelectorForView('homescreen');
export const leadsStringsSelector = createSelectorForView('leads');
export const arysStringsSelector = createSelectorForView('arys');
export const loginStringsSelector = createSelectorForView('login');
export const notificationStringsSelector = createSelectorForView('notification');
export const projectStringsSelector = createSelectorForView('project');
export const connectorStringsSelector = createSelectorForView('connector');
export const userStringsSelector = createSelectorForView('user');
export const pageTitleStringsSelector = createSelectorForView('pageTitle');
export const assessmentSummaryStringsSelector = createSelectorForView('assessmentSummary');

const getStringRefsInCode = (usageMap, viewName, stringName) => (
    (usageMap[viewName] && usageMap[viewName][stringName])
        ? usageMap[viewName][stringName].length
        : 0
);
const getViewFromViews = (views = {}, viewName) => (
    views[viewName] || {}
);
const getViewFromUsageMap = (usedMaps = {}, viewName) => (
    usedMaps[viewName] || {}
);
const getStringIdFromView = (view = {}, stringName) => (
    view[stringName]
);
const getStringFromStrings = (strings = {}, stringId) => (
    strings[stringId]
);

const usageMapSelector = () => {
    try {
        /* eslint-disable global-require */
        /* eslint-disable import/no-unresolved */
        return require('../../generated/usage').default;
        /* eslint-enable global-require */
        /* eslint-enable import/no-unresolved */
    } catch (ex) {
        console.warn(ex);
        return {};
    }
};

const duplicatedRawStringsSelector = createSelector(
    selectedRawStringsSelector,
    (strings) => {
        // Get duplicated strings
        const duplicatedRawStrings = {};

        const memory = {};
        Object.keys(strings).forEach((stringId) => {
            const value = getStringFromStrings(strings, stringId).toLowerCase();
            // first encountered string id with this value
            const firstEncounteredStringId = memory[value];
            if (firstEncounteredStringId) {
                duplicatedRawStrings[stringId] = firstEncounteredStringId;
            } else {
                // memorize duplicates
                memory[value] = stringId;
            }
        });

        return duplicatedRawStrings;
    },
);

const referenceCountOfRawStringsSelector = createSelector(
    selectedRawStringsSelector,
    selectedViewStringsSelector,
    usageMapSelector,
    (strings, views, usedMaps) => {
        // Initialize reference count
        const stringsReferenceCount = {};
        Object.keys(strings).forEach((stringId) => {
            stringsReferenceCount[stringId] = 0;
        });
        // Calculate reference count
        Object.keys(views).forEach((viewName) => {
            const view = getViewFromViews(views, viewName);
            Object.keys(view).forEach((stringName) => {
                const refsInCode = getStringRefsInCode(usedMaps, viewName, stringName);
                const stringId = getStringIdFromView(view, stringName);
                const string = getStringFromStrings(strings, stringId);
                if (stringId && string) {
                    stringsReferenceCount[stringId] += refsInCode;
                }
            });
        });
        return stringsReferenceCount;
    },
);

export const problemsWithRawStringsSelector = createSelector(
    selectedRawStringsSelector,
    selectedViewStringsSelector,
    usageMapSelector,
    (strings, views, usedMaps) => {
        const problems = [];

        const stringIdReferenced = Object.keys(strings).reduce(
            (acc, val) => {
                acc[val] = false;
                return acc;
            },
            {},
        );
        Object.keys(views).forEach((viewName) => {
            const view = getViewFromViews(views, viewName);
            Object.keys(view).forEach((stringName) => {
                // Identify bad references in view (not available in strings)
                const stringId = getStringIdFromView(view, stringName);
                if (stringId) {
                    stringIdReferenced[stringId] = true;
                }
            });
        });
        Object.keys(stringIdReferenced).forEach((key) => {
            if (!stringIdReferenced[key]) {
                problems.push({
                    key: problems.length,
                    type: 'warning',
                    title: 'Unused string',
                    description: `${key}: ${strings[key]}`,
                });
            }
        });

        Object.keys(views).forEach((viewName) => {
            const view = getViewFromViews(views, viewName);
            Object.keys(view).forEach((stringName) => {
                // Identify unused references in view (not referenced in code)
                const refsInCode = getStringRefsInCode(usedMaps, viewName, stringName);
                if (refsInCode <= 0) {
                    problems.push({
                        key: problems.length,
                        type: 'warning',
                        title: 'Unused string',
                        description: `${viewName}:${stringName}`,
                    });
                }

                // Identify bad references in view (not available in strings)
                const stringId = getStringIdFromView(view, stringName);
                const string = getStringFromStrings(strings, stringId);
                if (!stringId || !string) {
                    problems.push({
                        key: problems.length,
                        type: 'error',
                        title: 'Undefined value for string',
                        description: `${viewName}:${stringName}`,
                    });
                }
            });
        });

        // Identify bad-references of string in code
        Object.keys(usedMaps).forEach((viewName) => {
            const viewFromUsage = getViewFromUsageMap(usedMaps, viewName);
            const view = getViewFromViews(views, viewName);
            Object.keys(viewFromUsage).forEach((stringName) => {
                // Identify bad references in view (not available in views or strings)
                const stringId = getStringIdFromView(view, stringName);
                const string = getStringFromStrings(strings, stringId);
                if (!stringId || !string) {
                    problems.push({
                        key: problems.length,
                        type: 'error',
                        title: 'Undefined value for string',
                        description: `${viewName}:${stringName}`,
                    });
                }
            });
        });

        return problems;
    },
);

export const allStringsSelector = createSelector(
    selectedRawStringsSelector,
    duplicatedRawStringsSelector,
    referenceCountOfRawStringsSelector,
    (strings, duplicatedRawStrings, stringsReferenceCount) => (
        Object.keys(strings).reduce(
            (acc, id) => acc.concat({
                id,
                value: strings[id],
                referenceCount: stringsReferenceCount[id],
                duplicated: duplicatedRawStrings[id],
            }),
            [],
        )
    ),
);

export const viewStringsSelector = createSelector(
    selectedRawStringsSelector,
    selectedViewStringsSelector,
    usageMapSelector,
    (strings, views, usedMaps) => {
        // Initialize
        const finalViews = {};
        // Calculate
        Object.keys(views).forEach((viewName) => {
            const view = getViewFromViews(views, viewName);
            finalViews[viewName] = Object.keys(view).map((stringName) => {
                const refsInCode = getStringRefsInCode(usedMaps, viewName, stringName);
                const stringId = getStringIdFromView(view, stringName);
                const string = getStringFromStrings(strings, stringId);

                return {
                    name: stringName,
                    value: string,
                    valueId: stringId,
                    referenceCount: refsInCode,
                };
            });
        });
        return finalViews;
    },
);
