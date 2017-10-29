import {
    SET_USER_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT,
    SET_USER_GROUPS,
    SET_ACTIVE_PROJECT,
    SET_LEADS,
    DUMMY_ACTION,
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

export const setProjectAction = ({ projectId, project }) => ({
    type: SET_USER_PROJECT,
    projectId,
    project,
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

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});
