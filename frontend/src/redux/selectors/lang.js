import { createSelector } from 'reselect';
import stringFormat from 'string-format';
import devLang from '../initial-state/dev-lang';

const emptyObject = {};

const selectedLanguageNameSelector = ({ lang }) => (
    lang.selectedLanguage
);
const fallbackLanguageNameSelector = ({ lang }) => (
    lang.fallbackLanguage
);

const languagesSelector = ({ lang }) => (
    lang.languages || emptyObject
);

const selectedLanguageSelector = createSelector(
    selectedLanguageNameSelector,
    languagesSelector,
    (selectedLanguage, languages) => languages[selectedLanguage] || emptyObject,
);

export const selectedStringsSelector = createSelector(
    selectedLanguageSelector,
    selectedLanguage => selectedLanguage.strings || emptyObject,
);

export const selectedLinksSelector = createSelector(
    selectedLanguageSelector,
    selectedLanguage => selectedLanguage.links || emptyObject,
);

const fallbackLanguageSelector = createSelector(
    fallbackLanguageNameSelector,
    languagesSelector,
    (fallbackLanguage, languages) => languages[fallbackLanguage] || devLang,
);

export const fallbackStringsSelector = createSelector(
    fallbackLanguageSelector,
    fallbackLanguage => fallbackLanguage.strings || emptyObject,
);

export const fallbackLinksSelector = createSelector(
    fallbackLanguageSelector,
    fallbackLanguage => fallbackLanguage.links || emptyObject,
);

// Af page

const getStringRefsInCode = (usageMap, linkName, stringName) => (
    (usageMap[linkName] && usageMap[linkName][stringName])
        ? usageMap[linkName][stringName].length
        : 0
);
const getLinkFromLinks = (links = {}, linkName) => (
    links[linkName] || {}
);
const getLinkFromUsageMap = (usageMaps = {}, linkName) => (
    usageMaps[linkName] || {}
);
const getStringIdFromLink = (link = {}, stringName) => (
    link[stringName]
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

const duplicatedStringsSelector = createSelector(
    selectedStringsSelector,
    (strings) => {
        // Get duplicated strings
        const duplicatedStrings = {};

        const memory = {};
        Object.keys(strings).forEach((stringId) => {
            const value = getStringFromStrings(strings, stringId).toLowerCase();
            // first encountered string id with this value
            const firstEncounteredStringId = memory[value];
            if (firstEncounteredStringId) {
                // set id of first encountered string
                duplicatedStrings[stringId] = firstEncounteredStringId;
            } else {
                // memorize to identify duplicates
                memory[value] = stringId;
            }
        });

        return duplicatedStrings;
    },
);

const referenceCountOfStringsSelector = createSelector(
    selectedStringsSelector,
    selectedLinksSelector,
    usageMapSelector,
    (strings, links, usageMaps) => {
        // Initialize reference count
        const stringsReferenceCount = {};
        Object.keys(strings).forEach((stringId) => {
            stringsReferenceCount[stringId] = 0;
        });
        // Calculate reference count
        Object.keys(links).forEach((linkName) => {
            const link = getLinkFromLinks(links, linkName);
            Object.keys(link).forEach((stringName) => {
                const refsInCode = getStringRefsInCode(usageMaps, linkName, stringName);
                const stringId = getStringIdFromLink(link, stringName);
                const string = getStringFromStrings(strings, stringId);
                if (stringId && string) {
                    stringsReferenceCount[stringId] += refsInCode;
                }
            });
        });
        return stringsReferenceCount;
    },
);

export const problemsWithStringsSelector = createSelector(
    selectedStringsSelector,
    selectedLinksSelector,
    usageMapSelector,
    (strings, links, usageMaps) => {
        const problems = [];

        const stringIdReferenced = Object.keys(strings).reduce(
            (acc, val) => {
                acc[val] = false;
                return acc;
            },
            {},
        );
        Object.keys(links).forEach((linkName) => {
            const link = getLinkFromLinks(links, linkName);
            Object.keys(link).forEach((stringName) => {
                // Identify bad references in link (not available in strings)
                const stringId = getStringIdFromLink(link, stringName);
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

        Object.keys(links).forEach((linkName) => {
            const link = getLinkFromLinks(links, linkName);
            Object.keys(link).forEach((stringName) => {
                // Identify unused references in link (not referenced in code)
                const refsInCode = getStringRefsInCode(usageMaps, linkName, stringName);
                if (refsInCode <= 0) {
                    problems.push({
                        key: problems.length,
                        type: 'warning',
                        title: 'Unused string',
                        description: `${linkName}:${stringName}`,
                    });
                }

                // Identify bad references in link (not available in strings)
                const stringId = getStringIdFromLink(link, stringName);
                const string = getStringFromStrings(strings, stringId);
                if (!stringId || !string) {
                    problems.push({
                        key: problems.length,
                        type: 'error',
                        title: 'Undefined value for string',
                        description: `${linkName}:${stringName}`,
                    });
                }
            });
        });

        // Identify bad-references of string in code
        Object.keys(usageMaps).forEach((linkName) => {
            const linkFromUsage = getLinkFromUsageMap(usageMaps, linkName);
            const link = getLinkFromLinks(links, linkName);
            Object.keys(linkFromUsage).forEach((stringName) => {
                // Identify bad references in link (not available in links or strings)
                const stringId = getStringIdFromLink(link, stringName);
                const string = getStringFromStrings(strings, stringId);
                if (!stringId || !string) {
                    problems.push({
                        key: problems.length,
                        type: 'error',
                        title: 'Undefined value for string',
                        description: `${linkName}:${stringName}`,
                    });
                }
            });
        });

        return problems;
    },
);

export const allStringsSelector = createSelector(
    selectedStringsSelector,
    duplicatedStringsSelector,
    referenceCountOfStringsSelector,
    (strings, duplicatedStrings, stringsReferenceCount) => (
        Object.keys(strings).reduce(
            (acc, id) => acc.concat({
                id,
                value: strings[id],
                referenceCount: stringsReferenceCount[id],
                duplicated: duplicatedStrings[id],
            }),
            [],
        )
    ),
);

export const linkStringsSelector = createSelector(
    selectedStringsSelector,
    selectedLinksSelector,
    usageMapSelector,
    (strings, links, usedMaps) => {
        // Initialize
        const finalLinks = {};
        // Calculate
        Object.keys(links).forEach((linkName) => {
            const link = getLinkFromLinks(links, linkName);
            finalLinks[linkName] = Object.keys(link).map((stringName) => {
                const refsInCode = getStringRefsInCode(usedMaps, linkName, stringName);
                const stringId = getStringIdFromLink(link, stringName);
                const string = getStringFromStrings(strings, stringId);

                return {
                    name: stringName,
                    value: string,
                    valueId: stringId,
                    referenceCount: refsInCode,
                };
            });
        });
        return finalLinks;
    },
);

export const linkKeysSelector = createSelector(
    usageMapSelector,
    usedMaps => Object.keys(usedMaps),
);

// FIXME: remove these later

const createSelectorForLink = name => createSelector(
    selectedLinksSelector,
    selectedStringsSelector,
    (selectedLinks, selectedStrings) => (identifier, params) => {
        const namedLinkStrings = selectedLinks[name] || emptyObject;
        const id = namedLinkStrings[identifier];
        if (!id || !selectedStrings[id]) {
            console.warn(`String not found for ${name}:${identifier}`);
            return `{${name}:${identifier}}`;
        }
        if (params) {
            return stringFormat(selectedStrings[id], params);
        }
        return selectedStrings[id];
    },
);
export const afStringsSelector = createSelectorForLink('af');
export const apiStringsSelector = createSelectorForLink('api');
export const aryStringsSelector = createSelectorForLink('ary');
export const ceStringsSelector = createSelectorForLink('ce');
export const commonStringsSelector = createSelectorForLink('common');
export const countriesStringsSelector = createSelectorForLink('countries');
export const entryStringsSelector = createSelectorForLink('entry');
export const exportStringsSelector = createSelectorForLink('export');
export const fourHundredFourStringsSelector = createSelectorForLink('fourHundredFour');
export const homescreenStringsSelector = createSelectorForLink('homescreen');
export const leadsStringsSelector = createSelectorForLink('leads');
export const arysStringsSelector = createSelectorForLink('arys');
export const loginStringsSelector = createSelectorForLink('login');
export const notificationStringsSelector = createSelectorForLink('notification');
export const projectStringsSelector = createSelectorForLink('project');
export const connectorStringsSelector = createSelectorForLink('connector');
export const userStringsSelector = createSelectorForLink('user');
export const pageTitleStringsSelector = createSelectorForLink('pageTitle');
export const assessmentMetadataStringsSelector = createSelectorForLink('assessmentMetadata');
export const assessmentMethodologyStringsSelector = createSelectorForLink('assessmentMethodology');
export const assessmentSummaryStringsSelector = createSelectorForLink('assessmentSummary');
