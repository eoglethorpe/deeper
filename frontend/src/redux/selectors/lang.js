import { createSelector } from 'reselect';
import devLang from '../initial-state/dev-lang';
import { groupList } from '../../vendor/react-store/utils/common';

const emptyObject = {};
const emptyArray = [];

export const selectedLanguageNameSelector = ({ lang }) => (
    lang.selectedLanguage || '$devLang'
);
export const fallbackLanguageNameSelector = ({ lang }) => (
    lang.fallbackLanguage || '$devLang'
);
export const availableLanguagesSelector = ({ lang }) => (
    lang.availableLanguages || emptyArray
);

const languagesSelector = ({ lang }) => (
    lang.languages || emptyObject
);

const selectedLanguageSelector = createSelector(
    selectedLanguageNameSelector,
    languagesSelector,
    (selectedLanguage, languages) => (
        selectedLanguage === '$devLang'
            ? devLang
            : languages[selectedLanguage] || emptyObject
    ),
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
    (fallbackLanguage, languages) => (
        fallbackLanguage === '$devLang'
            ? devLang
            : languages[fallbackLanguage] || emptyObject
    ),
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

const getStringRefsInCode = (usageMap, linkCollectionName, stringName) => (
    (usageMap[linkCollectionName] && usageMap[linkCollectionName][stringName])
        ? usageMap[linkCollectionName][stringName].length
        : 0
);
const getLinkCollectionFromLinks = (links = {}, linkName) => (
    links[linkName] || {}
);
const getLinkCollectionFromUsageMap = (usageMaps = {}, linkName) => (
    usageMaps[linkName] || {}
);
const getStringNameFromLinkCollection = (linkCollection = {}, linkName) => (
    linkCollection[linkName]
);
const getStringFromStrings = (strings = {}, stringName) => (
    strings[stringName]
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
        Object.keys(strings).forEach((stringName) => {
            const value = getStringFromStrings(strings, stringName).toLowerCase();
            // first encountered string id with this value
            const firstEncounteredStringName = memory[value];
            if (firstEncounteredStringName) {
                // set id of first encountered string
                duplicatedStrings[stringName] = firstEncounteredStringName;
            } else {
                // memorize to identify duplicates
                memory[value] = stringName;
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
        // Initialize reference count for string
        const stringReferenceCount = {};
        Object.keys(strings).forEach((stringName) => {
            stringReferenceCount[stringName] = 0;
        });
        // Calculate reference count for string
        Object.keys(links).forEach((linkCollectionName) => {
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            Object.keys(linkCollection).forEach((linkName) => {
                const refsInCode = getStringRefsInCode(usageMaps, linkCollectionName, linkName);
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (stringName !== undefined && string !== undefined) {
                    stringReferenceCount[stringName] += refsInCode;
                }
            });
        });
        return stringReferenceCount;
    },
);

export const problemsWithStringsSelector = createSelector(
    selectedStringsSelector,
    selectedLinksSelector,
    usageMapSelector,
    (strings, links, usageMaps) => {
        const problems = [];

        // Identify strings not linked by any linkCollection
        const stringNameReferenced = Object.keys(strings).reduce(
            (acc, val) => {
                acc[val] = false;
                return acc;
            },
            {},
        );
        Object.keys(links).forEach((linkCollectionName) => {
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            Object.keys(linkCollection).forEach((linkName) => {
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                if (stringName !== undefined) {
                    stringNameReferenced[stringName] = true;
                }
            });
        });
        Object.keys(stringNameReferenced).forEach((key) => {
            if (!stringNameReferenced[key]) {
                problems.push({
                    key: problems.length,
                    type: 'warning',
                    title: 'Unused string',
                    description: `${key}: ${strings[key]}`,
                });
            }
        });

        // Identify unused links
        // Identify links not referencing a valid string
        Object.keys(links).forEach((linkCollectionName) => {
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            Object.keys(linkCollection).forEach((linkName) => {
                // identify unused links
                const refsInCode = getStringRefsInCode(usageMaps, linkCollectionName, linkName);
                if (refsInCode <= 0) {
                    problems.push({
                        key: problems.length,
                        type: 'warning',
                        title: 'Unused link',
                        linkCollectionName,
                        description: `${linkCollectionName}:${linkName}`,
                    });
                }

                // identify bad links
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (stringName === undefined || string === undefined) {
                    problems.push({
                        key: problems.length,
                        type: 'error',
                        title: 'Bad link',
                        linkCollectionName,
                        description: `${linkCollectionName}:${linkName}`,
                    });
                }
            });
        });

        // Identify bad-references of string in code
        Object.keys(usageMaps).forEach((linkCollectionName) => {
            const linkCollectionFromUsage = getLinkCollectionFromUsageMap(
                usageMaps,
                linkCollectionName,
            );
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            Object.keys(linkCollectionFromUsage).forEach((linkName) => {
                // Identify bad references in link (not available in links or strings)
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (!stringName || !string) {
                    problems.push({
                        key: problems.length,
                        type: 'error',
                        title: 'Undefined link',
                        linkCollectionName,
                        description: `${linkCollectionName}:${linkName}`,
                    });
                }
            });
        });

        return groupList(
            problems,
            problem => problem.linkCollectionName || '$all',
        );
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
        const finalLinks = {};
        Object.keys(links).forEach((linkCollectionName) => {
            const linkCollection = getLinkCollectionFromLinks(links, linkCollectionName);
            finalLinks[linkCollectionName] = Object.keys(linkCollection).map((linkName) => {
                const refsInCode = getStringRefsInCode(usedMaps, linkCollectionName, linkName);
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);

                return {
                    name: linkName,
                    value: string,
                    valueId: stringName,
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
