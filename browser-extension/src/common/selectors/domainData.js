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
