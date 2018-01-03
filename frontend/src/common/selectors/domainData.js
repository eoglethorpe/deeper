import { createSelector } from 'reselect';
import { activeUserSelector } from './auth';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

// Using props

export const userIdFromRoute = (state, { match }) => match.params.userId;
export const groupIdFromRoute = (state, { match }) => match.params.userGroupId;
export const countryIdFromProps = (state, { match }) => match.params.countryId;
export const projectIdFromRoute = (state, { match }) => match.params.projectId;

// Used in silo-reducers
export const analysisFrameworkIdFromProps = (state, { match }) => match.params.analysisFrameworkId;
export const categoryEditorIdFromProps = (state, { match }) => match.params.categoryEditorId;
export const leadIdFromRoute = (state, { match }) => match.params.leadId;
export const categoryEditorIdFromRoute = (state, { match }) => match.params.categoryEditorId;

export const regionIdFromProps = (state, { regionId }) => regionId;
export const userGroupIdFromProps = (state, { userGroupId }) => userGroupId;
export const analysisFrameworkIdFromPropsForProject = (state, { afId }) => afId;
export const categoryEditorIdFromPropsForProject = (state, { ceId }) => ceId;

// COMMON

export const leadFilterOptionsSelector = ({ domainData }) => (
    domainData.leadFilterOptions || emptyObject
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

const usersSelector = ({ domainData }) => (
    domainData.users || emptyObject
);

const categoryEditorsSelector = ({ domainData }) => (
    domainData.categoryEditors || emptyObject
);

// CONSTANTS

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

// MODIFERS

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
