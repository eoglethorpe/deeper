import { createSelector } from 'reselect';
import devLang from '../initial-state/dev-lang';

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
        // Initialize new problems
        const newProblems = Object.keys(usageMaps).reduce(
            (acc, key) => {
                acc[key] = {
                    badLink: {
                        title: 'Bad link',
                        type: 'error',
                        instances: [],
                    },
                    undefinedLink: {
                        title: 'Undefined link',
                        type: 'error',
                        instances: [],
                    },
                    unusedLinks: {
                        title: 'Unused link',
                        type: 'warning',
                        instances: [],
                    },
                };
                return acc;
            },
            {
                $all: {
                    unusedStrings: {
                        title: 'Unused string',
                        type: 'warning',
                        instances: [],
                    },
                },
            },
        );

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
                newProblems.$all.unusedStrings.instances.push(`${key}: ${strings[key]}`);
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
                    newProblems[linkCollectionName].unusedLinks.instances.push(linkName);
                }

                // identify bad links
                const stringName = getStringNameFromLinkCollection(linkCollection, linkName);
                const string = getStringFromStrings(strings, stringName);
                if (stringName === undefined || string === undefined) {
                    newProblems[linkCollectionName].badLink.instances.push(linkName);
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
                    newProblems[linkCollectionName].undefinedLink.instances.push(linkName);
                }
            });
        });
        return newProblems;
    },
);

export const problemCountsWithStringsSelector = createSelector(
    problemsWithStringsSelector,
    problems => Object.keys(problems).reduce(
        (acc, key) => {
            const problemValues = Object.values(problems[key]);

            let errorCount = 0;
            let warningCount = 0;
            problemValues.forEach((problem) => {
                if (problem.type === 'error') {
                    errorCount += problem.instances.length;
                } else if (problem.type === 'warning') {
                    warningCount += problem.instances.length;
                }
            });

            acc[key] = { errorCount, warningCount };
            return acc;
        },
        {},
    ),
);

export const allStringsSelector = createSelector(
    selectedStringsSelector,
    duplicatedStringsSelector,
    referenceCountOfStringsSelector,
    (strings, duplicatedStrings, stringsReferenceCount) => (
        Object.keys(strings).reduce(
            (acc, id) => acc.concat({
                id,
                string: strings[id],
                refs: stringsReferenceCount[id],
                duplicates: duplicatedStrings[id],
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
                    id: linkName,
                    string,
                    stringId: stringName,
                    refs: refsInCode,
                };
            });
        });
        return finalLinks;
    },
);

export const linkKeysSelector = createSelector(
    usageMapSelector,
    usedMaps => Object.keys(usedMaps).sort(),
);

export const linkNamesSelector = createSelector(
    usageMapSelector,
    usedMaps => Object.keys(usedMaps).sort(),
);
