import { createSelector } from 'reselect';
import { activeUserSelector } from '../auth';
import {
    userIdFromRoute,
    groupIdFromRoute,
    countryIdFromProps,
    projectIdFromRoute,

    regionIdFromProps,
    userGroupIdFromProps,
    analysisFrameworkIdFromPropsForProject,
    categoryEditorIdFromPropsForProject,
} from './props';
import {
    leadFilterOptionsSelector,
    regionsSelector,
    projectsSelector,
    projectsOptionsSelector,
    analysisFrameworksSelector,
    adminLevelsSelector,
    groupsSelector,
    usersSelector,
    categoryEditorsSelector,
    regionsListSelector,
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

// OTHERS

// regionIdFromProps
export const regionDetailForRegionSelector = createSelector(
    regionsSelector,
    regionIdFromProps,
    (regions, regionId) => (regions[regionId] || emptyObject),
);

// regionIdFromProps
export const adminLevelForRegionSelector = createSelector(
    adminLevelsSelector,
    regionIdFromProps,
    (adminLevels, regionId) => (
        adminLevels[regionId] || emptyList
    ),
);

// countryIdFromProps
export const countryDetailSelector = createSelector(
    regionsListSelector,
    countryIdFromProps,
    (regions, activeCountry) => (
        regions.find(
            country => country.id === +activeCountry,
        ) || emptyObject
    ),
);

// analysisFrameworkIdFromPropsForProject
export const analysisFrameworkDetailSelector = createSelector(
    analysisFrameworksSelector,
    analysisFrameworkIdFromPropsForProject,
    (analysisFrameworks, afId) => (
        analysisFrameworks[afId] || emptyObject
    ),
);

// categoryEditorIdFromPropsForProject
export const categoryEditorDetailSelector = createSelector(
    categoryEditorsSelector,
    categoryEditorIdFromPropsForProject,
    (categoryEditors, ceId) => (
        categoryEditors[ceId] || emptyObject
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
                        userGroup => (userGroup.id === +userGroupId),
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

// userGroupIdFromProps
export const userGroupDetailsSelector = createSelector(
    groupsSelector,
    userGroupIdFromProps,
    (userGroups, userGroupId) => (userGroups[userGroupId] || emptyObject),
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
        (user.projects && user.projects.map(
            projectId => projects[projectId],
        )) || emptyList
    ),
);

// userIdFromRoute
export const userGroupsSelector = createSelector(
    groupsSelector,
    userSelector,
    (userGroups, user) => (
        (user.userGroups && user.userGroups.map(
            userGroupId => (userGroups[userGroupId]),
        )) || emptyList
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
export const projectDetailsSelector = createSelector(
    projectsSelector,
    projectIdFromRoute,
    (projects, activeProject) => projects[activeProject] || emptyObject,
);

// projectIdFromRoute
export const projectOptionsSelector = createSelector(
    projectsOptionsSelector,
    projectIdFromRoute,
    (projectsOptions, activeProject) => projectsOptions[activeProject] || emptyObject,
);
