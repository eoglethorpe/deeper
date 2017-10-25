import { createSelector } from 'reselect';
import { activeUserSelector } from './auth';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

export const userIdFromRoute = (state, { match }) => match.params.userId;

export const activeProjectSelector = ({ domainData }) => (domainData.activeProject);
export const leadsSelector = ({ domainData }) => (domainData.leads || emptyList);
export const totalLeadsCountSelector = ({ domainData }) => (
    domainData.totalLeadsCount || emptyList
);
export const leadFilterOptionsSelector = ({ domainData }) => (
    domainData.leadFilterOptions || emptyObject
);
export const countriesSelector = ({ domainData }) => (domainData.countries || emptyList);
export const usersSelector = ({ domainData }) => (domainData.users || emptyObject);

export const adminLevelSelector = ({ domainData }, { countryId }) => (
    domainData.adminLevels[countryId] || emptyList
);

export const projectsSelector = ({ domainData }) => (domainData.projects || emptyObject);

export const projectDetailsSelector = createSelector(
    projectsSelector,
    activeProjectSelector,
    (projects, activeProject) => projects[activeProject] || emptyObject,
);

export const countryDetailSelector = ({ domainData }, { countryId }) => (
    domainData.countries.find(country => country.id === countryId) || emptyObject
);

// Selector depending on user id from route (url)

export const userSelector = createSelector(
    userIdFromRoute,
    usersSelector,
    (userId, users) => (users[userId] || emptyObject),
);

export const userInformationSelector = createSelector(
    userSelector,
    user => (user.information || emptyObject),
);

export const userProjectsSelector = createSelector(
    userSelector,
    user => (user.projects || emptyList),
);

export const userGroupsSelector = createSelector(
    userSelector,
    user => (user.userGroups || emptyList),
);
// Selector depending on user id from state (logged-in user)

export const currentUserSelector = createSelector(
    activeUserSelector,
    usersSelector,
    (activeUser, users) => (users[activeUser.userId] || emptyObject),
);

export const currentUserInformationSelector = createSelector(
    currentUserSelector,
    user => (user.information || emptyObject),
);

export const currentUserProjectsSelector = createSelector(
    currentUserSelector,
    user => (user.projects || emptyList),
);

export const currentUserActiveProjectSelector = createSelector(
    currentUserProjectsSelector,
    activeProjectSelector,
    (currentUserProjects, activeProject) => (
        currentUserProjects.find(project => project.id === activeProject) || emptyObject
    ),
);


// Selector depending on project id from state (active project)

export const leadsForProjectSelector = createSelector(
    activeProjectSelector,
    leadsSelector,
    (activeProject, leads) => (leads[activeProject] || emptyList),
);

export const totalLeadsCountForProjectSelector = createSelector(
    activeProjectSelector,
    totalLeadsCountSelector,
    (activeProject, totalLeadsCount) => (totalLeadsCount[activeProject] || 0),
);

export const leadFilterOptionsForProjectSelector = createSelector(
    activeProjectSelector,
    leadFilterOptionsSelector,
    (activeProject, leadFilterOptions) => (leadFilterOptions[activeProject] || emptyObject),
);
