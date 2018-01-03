import { createSelector } from 'reselect'; // eslint-disable-line no-unused-vars

// NOTE: Use these to make sure reference don't change
const emptyList = []; // eslint-disable-line no-unused-vars
const emptyObject = {}; // eslint-disable-line no-unused-vars

/*
export const leadFilterOptionsSelector = ({ domainData }) => (
    domainData.leadFilterOptions || emptyObject
);

export const analysisFrameworkDetailSelector = createSelector(
    analysisFrameworksSelector,
    analysisFrameworkIdFromPropsForProject,
    (analysisFrameworks, afId) => (
        analysisFrameworks[afId] || emptyObject
    ),
);
*/

// eslint-disable-next-line import/prefer-default-export
export const inputValuesForTabSelector = ({ domainData, mem }) => {
    const { currentTabId } = mem;

    if (currentTabId) {
        const tabData = domainData[currentTabId];

        if (tabData) {
            return tabData.inputValues || emptyObject;
        }
    }

    return emptyObject;
};
