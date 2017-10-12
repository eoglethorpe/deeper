import {
    SET_USER_INFORMATION,
    SET_USER_PROJECTS,
    SET_ACTIVE_PROJECT,
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


export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});
