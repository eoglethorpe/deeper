import { createSelector } from 'reselect';

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
    (selectedViewStrings, selectedRawStrings) => (identifier) => {
        const namedViewStrings = selectedViewStrings[name] || emptyObject;
        const id = namedViewStrings[identifier];
        if (!id || !selectedRawStrings[id]) {
            console.warn(`String not found for ${name}:${identifier}`);
            return `{${name}:${identifier}}`;
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
export const loginStringsSelector = createSelectorForView('login');
export const notificationStringsSelector = createSelectorForView('notification');
export const projectStringsSelector = createSelectorForView('project');
export const userStringsSelector = createSelectorForView('user');
export const pageTitleStringsSelector = createSelectorForView('pageTitle');
