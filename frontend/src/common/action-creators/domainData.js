import {
    SET_USER_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_GROUPS,
    DUMMY_ACTION,
    SET_ACTIVE_PROJECT,
    SET_COUNTRIES,
    SET_LEADS,
} from '../action-types/domainData';

export const setUserInformationAction = ({ userId, information }) => ({
    type: SET_USER_INFORMATION,
    userId,
    information,
});

export const setUserProjectsAction = ({ userId, projects }) => ({
    type: SET_USER_PROJECTS,
    userId,
    projects,
});

export const setUserGroupsAction = ({ userId, userGroups }) => ({
    type: SET_USER_GROUPS,
    userId,
    userGroups,
});

export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const setLeadsAction = ({ projectId, leads, totalLeadsCount }) => ({
    type: SET_LEADS,
    projectId,
    leads,
    totalLeadsCount,
});

export const setCountriesAction = ({ countries }) => ({
    type: SET_COUNTRIES,
    countries,
});

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});
