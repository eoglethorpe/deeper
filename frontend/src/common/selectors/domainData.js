import { createSelector } from 'reselect';
import { activeUserSelector } from './auth';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};


// Using props

export const userIdFromRoute = (state, { match }) => match.params.userId;
export const groupIdFromRoute = (state, { match }) => match.params.userGroupId;

export const countryIdFromProps = (state, { countryId }) => countryId;

// Using state

export const activeProjectSelector = ({ domainData }) => (
    domainData.activeProject
);
export const activeCountrySelector = ({ domainData }) => (
    domainData.activeCountry
);
export const leadsSelector = ({ domainData }) => (
    domainData.leads || emptyObject
);
export const countriesSelector = ({ domainData }) => (
    domainData.countries || emptyList
);
export const adminLevelsSelector = ({ domainData }) => (
    domainData.adminLevels || emptyObject
);
export const usersSelector = ({ domainData }) => (
    domainData.users || emptyObject
);
export const projectsSelector = ({ domainData }) => (
    domainData.projects || emptyObject
);

export const groupsSelector = ({ domainData }) => (
    domainData.userGroups || emptyList
);

export const totalLeadsCountSelector = ({ domainData }) => (
    domainData.totalLeadsCount || emptyObject
);
export const leadFilterOptionsSelector = ({ domainData }) => (
    domainData.leadFilterOptions || emptyObject
);

// FIXME: rename to adminLevelForCountrySelector
export const adminLevelSelector = createSelector(
    adminLevelsSelector,
    countryIdFromProps,
    (adminLevels, countryId) => (
        adminLevels[countryId] || emptyList
    ),
);

// FIXME: rename to countryDetailForCountrySelector
export const countryDetailSelector = createSelector(
    countriesSelector,
    activeCountrySelector,
    (countries, activeCountry) => (
        countries.find(country => country.id === activeCountry) || emptyObject
    ),
);

export const projectDetailsSelector = createSelector(
    projectsSelector,
    activeProjectSelector,
    (projects, activeProject) => projects[activeProject] || emptyObject,
);

export const usersInformationListSelector = createSelector(
    usersSelector,
    users => (Object.keys(users).map(id =>
        users[id].information,
    ) || emptyList).filter(d => d),
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

export const groupSelector = createSelector(
    groupsSelector,
    groupIdFromRoute,
    (userGroups, userGroupId) => (userGroups[userGroupId] || emptyObject),
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

// Selector depending on user id from state (logged-in user)
// and on project id from state (active project)

export const currentUserActiveProjectSelector = createSelector(
    currentUserProjectsSelector,
    activeProjectSelector,
    (currentUserProjects, activeProject) => (
        currentUserProjects.find(project => project.id === activeProject) || emptyObject
    ),
);
