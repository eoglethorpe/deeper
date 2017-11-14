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

export const leadsSelector = ({ domainData }) => (
    domainData.leads || emptyObject
);
export const countriesSelector = ({ domainData }) => (
    domainData.countries || emptyObject
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
    domainData.userGroups || emptyObject
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
    projectsSelector,
    userSelector,
    (projects, user) => ((user.projects &&
        user.projects.map(projectId => (
            projects[projectId]
        ))) || emptyList),
);

export const userGroupsSelector = createSelector(
    groupsSelector,
    userSelector,
    (userGroups, user) => ((user.userGroups &&
        user.userGroups.map(userGroupId => (
            userGroups[userGroupId]
        ))) || emptyList),
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
    projectsSelector,
    (user, projects) => ((user.projects &&
        user.projects.map(projectId => (
            projects[projectId] || emptyObject
        ))
    ) || emptyList),
);
