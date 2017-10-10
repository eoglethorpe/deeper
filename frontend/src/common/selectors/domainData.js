import { createSelector } from 'reselect';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

export const userIdFromRoute = (state, { match }) => match.params.userId;

export const leadsSelector = ({ domainData }) => (domainData.leads || emptyList);
export const countriesSelector = ({ domainData }) => (domainData.countries || emptyList);
export const usersSelector = ({ domainData }) => (domainData.users || emptyObject);

// OBSOLETE:
export const projectsSelector = ({ domainData }) => (domainData.projects || emptyList);

export const userSelector = createSelector(
    userIdFromRoute,
    usersSelector,
    (userId, users) => (users[userId] || emptyObject),
);


export const userInfoSelector = createSelector(
    userSelector,
    user => (user.information || emptyObject),
);
