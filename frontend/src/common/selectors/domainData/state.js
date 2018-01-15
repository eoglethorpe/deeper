import { createSelector } from 'reselect';

const emptyList = [];
const emptyObject = {};

export const userExportsSelector = ({ domainData }) => (
    domainData.userExports || emptyObject
);

export const userExportsListSelector = createSelector(
    userExportsSelector,
    userExports => (
        (userExports && Object.values(userExports).filter(
            userExport => userExport,
        )) || emptyList
    ),
);

export const leadsSelector = ({ domainData }) => (
    domainData.leads || emptyObject
);

export const leadFilterOptionsSelector = ({ domainData }) => (
    domainData.leadFilterOptions || emptyObject
);

export const entryFilterOptionsSelector = ({ domainData }) => (
    domainData.entryFilterOptions || emptyObject
);

export const visualizationSelector = ({ domainData }) => (
    domainData.visualization || emptyObject
);

export const regionsSelector = ({ domainData }) => (
    domainData.regions || emptyObject
);

export const projectsSelector = ({ domainData }) => (
    domainData.projects || emptyObject
);

export const geoOptionsSelector = ({ domainData }) => (
    domainData.geoOptions || emptyObject
);

export const projectsOptionsSelector = ({ domainData }) => (
    domainData.projectsOptions || emptyObject
);

export const analysisFrameworksSelector = ({ domainData }) => (
    domainData.analysisFrameworks || emptyObject
);

export const adminLevelsSelector = ({ domainData }) => (
    domainData.adminLevels || emptyObject
);

export const groupsSelector = ({ domainData }) => (
    domainData.userGroups || emptyObject
);

export const usersSelector = ({ domainData }) => (
    domainData.users || emptyObject
);

export const categoryEditorsSelector = ({ domainData }) => (
    domainData.categoryEditors || emptyObject
);

// COMPLEX

export const hierarchialDataSelector = createSelector(
    visualizationSelector,
    viz => viz.hierarchialData || emptyObject,
);

export const chordDataSelector = createSelector(
    visualizationSelector,
    viz => viz.chordData || emptyObject,
);

export const correlationDataSelector = createSelector(
    visualizationSelector,
    viz => viz.correlationData || emptyObject,
);

export const barDataSelector = createSelector(
    visualizationSelector,
    viz => viz.barData || emptyObject,
);

export const forceDirectedDataSelector = createSelector(
    visualizationSelector,
    viz => viz.forceDirectedData || emptyObject,
);

export const usersInformationListSelector = createSelector(
    usersSelector,
    users => (
        Object.keys(users).map(
            id => users[id].information,
        ) || emptyList
    ).filter(d => d),
);

export const regionsListSelector = createSelector(
    regionsSelector,
    regions => (
        (regions && Object.values(regions).filter(
            region => region && region.public,
        )) || emptyList
    ),
);

export const analysisFrameworkListSelector = createSelector(
    analysisFrameworksSelector,
    analysisFrameworks => (
        (analysisFrameworks && Object.values(analysisFrameworks).filter(
            analysisFramework => analysisFramework,
        )) || emptyList
    ),
);

export const categoryEditorListSelector = createSelector(
    categoryEditorsSelector,
    categoryEditors => (
        (categoryEditors && Object.values(categoryEditors).filter(
            categoryEditor => categoryEditor,
        )) || emptyList
    ),
);
