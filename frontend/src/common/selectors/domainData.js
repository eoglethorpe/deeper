import { createSelector } from 'reselect';
import { activeUserSelector } from './auth';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

export const userIdFromRoute = (state, { match }) => match.params.userId;

export const activeProjectSelector = ({ domainData }) => (domainData.activeProject);
export const leadsSelector = ({ domainData }) => (domainData.leads || emptyList);
export const countriesSelector = ({ domainData }) => (domainData.countries || emptyList);
export const usersSelector = ({ domainData }) => (domainData.users || emptyObject);

export const adminLevelSelector = ({ domainData }, { countryId }) => (
    domainData.adminLevels[countryId] || emptyList
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
