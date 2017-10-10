import {
    SET_USER_INFORMATION,
    SET_USER_PROJECTS,
} from '../action-types/domainData';

export const setUserInformationAction = information => ({
    type: SET_USER_INFORMATION,
    information,
});

export const setUserProjectsAction = projects => ({
    type: SET_USER_PROJECTS,
    projects,
});
