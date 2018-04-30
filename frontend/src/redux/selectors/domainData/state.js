import { createSelector } from 'reselect';
import { compareString } from '../../../vendor/react-store/utils/common';

const emptyList = [];
const emptyObject = {};

export const userExportsSelector = ({ domainData }) => (
    domainData.userExports || emptyObject
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

export const aryFilterOptionsSelector = ({ domainData }) => (
    domainData.aryFilterOptions || emptyObject
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

export const regionsForAllProjectsSelector = ({ domainData }) => (
    domainData.regionsForProject || emptyObject
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

export const aryTemplatesSelector = ({ domainData }) => (
    domainData.aryTemplates || emptyObject
);

// COMPLEX

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

export const connectorSourcesSelector = ({ domainData }) => (
    domainData.connectorSources || emptyObject
);

export const connectorSourcesListSelector = createSelector(
    connectorSourcesSelector,
    c => Object.values(c).sort(
        (a = {}, b = {}) => compareString(a.title, b.title),
    ),
);
