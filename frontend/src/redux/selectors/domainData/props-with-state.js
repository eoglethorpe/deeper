import { createSelector } from 'reselect';
import { activeUserSelector } from '../auth';
import {
    userIdFromRoute,
    groupIdFromRoute,
    countryIdFromRoute,
    projectIdFromRoute,
    connectorIdFromRoute,

    afIdFromRoute,
    ceIdFromRoute,
} from './props';
import {
    leadFilterOptionsSelector,
    entryFilterOptionsSelector,
    aryFilterOptionsSelector,
    regionsSelector,
    projectsSelector,
    geoOptionsSelector,
    projectsOptionsSelector,
    analysisFrameworksSelector,
    adminLevelsSelector,
    groupsSelector,
    usersSelector,
    categoryEditorsSelector,
    aryTemplatesSelector,
    regionsListSelector,
    userExportsSelector,
} from './state';


const emptyList = [];
const emptyObject = {};


// activeUser
const currentUserSelector = createSelector(
    activeUserSelector,
    usersSelector,
    (activeUser, users) => (users[activeUser.userId] || emptyObject),
);

// userIdFromRoute
const userSelector = createSelector(
    userIdFromRoute,
    usersSelector,
    (userId, users) => (users[userId] || emptyObject),
);

export const userExportsListSelector = createSelector(
    userExportsSelector,
    projectIdFromRoute,
    (userExports, projectId) => (
        (userExports[projectId] && Object.values(userExports[projectId]).filter(
            userExport => userExport,
        )) || emptyList
    ),
);
// OTHERS

// countryIdFromRoute
export const countryDetailSelector = createSelector(
    regionsListSelector,
    countryIdFromRoute,
    (regions, activeCountry) => (
        regions.find(
            country => country.id === activeCountry,
        ) || emptyObject
    ),
);

// countryIdFromRoute
export const regionDetailForRegionSelector = createSelector(
    regionsSelector,
    countryIdFromRoute,
    (regions, regionId) => (regions[regionId] || emptyObject),
);

// countryIdFromRoute
export const adminLevelForRegionSelector = createSelector(
    adminLevelsSelector,
    countryIdFromRoute,
    (adminLevels, regionId) => (
        adminLevels[regionId] || emptyList
    ),
);

// groupIdFromRoute
export const groupSelector = createSelector(
    groupsSelector,
    groupIdFromRoute,
    (userGroups, userGroupId) => (userGroups[userGroupId] || emptyObject),
);

// groupIdFromRoute
export const userGroupProjectSelector = createSelector(
    projectsSelector,
    groupIdFromRoute,
    (projects, userGroupId) => (
        Object.keys(projects)
            .reduce(
                (acc, projectId) => {
                    const userGroups = (projects[projectId] || emptyObject).userGroups;
                    const hasUserGroup = userGroups && userGroups.find(
                        userGroup => (userGroup.id === userGroupId),
                    );
                    if (hasUserGroup) {
                        return [
                            ...acc,
                            projects[projectId],
                        ];
                    }
                    return acc;
                },
                emptyList,
            )
    ),
);

// userIdFromRoute
export const userInformationSelector = createSelector(
    userSelector,
    user => (user.information || emptyObject),
);

// userIdFromRoute
export const userProjectsSelector = createSelector(
    projectsSelector,
    userSelector,
    (projects, user) => (
        user.projects
            ? (
                user.projects
                    .map(projectId => projects[projectId])
                    .filter(project => !!project)
            )
            : emptyList
    ),
);

// userIdFromRoute
export const userGroupsSelector = createSelector(
    groupsSelector,
    userSelector,
    (userGroups, user) => (
        user.userGroups
            ? (
                user.userGroups
                    .map(userGroupId => (userGroups[userGroupId]))
                    .filter(userGroup => !!userGroup)
            )
            : emptyList
    ),
);

// activeUser
export const currentUserInformationSelector = createSelector(
    currentUserSelector,
    user => (user.information || emptyObject),
);

// activeUser
export const currentUserProjectsSelector = createSelector(
    currentUserSelector,
    projectsSelector,
    (user, projects) => (
        (user.projects && user.projects.map(projectId =>
            projects[projectId] || emptyObject,
        )) || emptyList
    ),
);

// activeUser
export const currentUserAdminProjectsSelector = createSelector(
    currentUserProjectsSelector,
    projects => projects.filter(project => (project.role === 'admin')),
);

// activeUser, projectIdFromRoute
export const currentUserActiveProjectSelector = createSelector(
    currentUserProjectsSelector,
    projectIdFromRoute,
    (currentUserProjects, activeProject) => (
        currentUserProjects.find(project => project.id === activeProject) || emptyObject
    ),
);

// projectIdFromRoute
export const leadFilterOptionsForProjectSelector = createSelector(
    projectIdFromRoute,
    leadFilterOptionsSelector,
    (activeProject, leadFilterOptions) => (leadFilterOptions[activeProject] || emptyObject),
);

// projectIdFromRoute
export const entryFilterOptionsForProjectSelector = createSelector(
    projectIdFromRoute,
    entryFilterOptionsSelector,
    (activeProject, entryFilterOptions) => (entryFilterOptions[activeProject] || emptyObject),
);

// projectIdFromRoute
export const aryFilterOptionsForProjectSelector = createSelector(
    projectIdFromRoute,
    aryFilterOptionsSelector,
    (activeProject, aryFilterOptions) => (aryFilterOptions[activeProject] || emptyObject),
);

// projectIdFromRoute
export const projectDetailsSelector = createSelector(
    projectsSelector,
    projectIdFromRoute,
    (projects, activeProject) => projects[activeProject] || emptyObject,
);

// projectIdFromRoute
export const geoOptionsForProjectSelector = createSelector(
    geoOptionsSelector,
    projectIdFromRoute,
    (geoOptions, activeProject) => geoOptions[activeProject] || emptyObject,
);

// projectIdFromRoute
export const projectOptionsSelector = createSelector(
    projectsOptionsSelector,
    projectIdFromRoute,
    (projectsOptions, activeProject) => projectsOptions[activeProject] || emptyObject,
);

// projectIdFromRoute
export const aryTemplateSelector = createSelector(
    aryTemplatesSelector,
    projectDetailsSelector,
    (aryTemplates, project) => (
        aryTemplates[project.id] || emptyObject
    ),
);

export const aryTemplateMetadataSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.metadataGroups || emptyList
    ),
);

export const aryTemplateMethodologySelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.methodologyGroups || emptyList
    ),
);

export const assessmentSectorsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.sectors || emptyList
    ),
);

export const focusesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.focuses || emptyList
    ),
);

export const affectedGroupsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.affectedGroups || emptyList
    ),
);

export const prioritySectorsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.prioritySectors || emptyList
    ),
);

export const specificNeedGroupsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.specificNeedGroups || emptyList
    ),
);

export const priorityIssuesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.priorityIssues || emptyList
    ),
);

export const affectedLocationsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.affectedLocations || emptyList
    ),
);

export const assessmentPillarsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scorePillars || emptyList
    ),
);

export const assessmentMatrixPillarsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scoreMatrixPillars || emptyList
    ),
);

export const assessmentScoreScalesSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scoreScales || emptyList
    ),
);

export const assessmentScoreBucketsSelector = createSelector(
    aryTemplateSelector,
    aryTemplate => (
        aryTemplate.scoreBuckets || emptyList
    ),
);

// afIdFromRoute
export const analysisFrameworkDetailSelector = createSelector(
    analysisFrameworksSelector,
    afIdFromRoute,
    (analysisFrameworks, afId) => (
        analysisFrameworks[afId] || emptyObject
    ),
);

// ceIdFromRoute
export const categoryEditorDetailSelector = createSelector(
    categoryEditorsSelector,
    ceIdFromRoute,
    (categoryEditors, ceId) => (
        categoryEditors[ceId] || emptyObject
    ),
);
