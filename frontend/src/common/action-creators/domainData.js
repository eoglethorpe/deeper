import {
    SET_USER_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT,
    SET_USER_GROUPS,
    SET_USER_GROUP,
    DUMMY_ACTION,
    SET_ACTIVE_PROJECT,
    SET_ACTIVE_COUNTRY,
    SET_COUNTRIES,
    ADD_NEW_COUNTRY,
    SET_LEADS,
    SET_LEAD_FILTER_OPTIONS,
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

export const setUserGroupAction = ({ userId, userGroup }) => ({
    type: SET_USER_GROUP,
    userId,
    userGroup,
});

export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const setActiveCountryAction = ({ activeCountry }) => ({
    type: SET_ACTIVE_COUNTRY,
    activeCountry,
});

export const setLeadsAction = ({ projectId, leads, totalLeadsCount }) => ({
    type: SET_LEADS,
    projectId,
    leads,
    totalLeadsCount,
});

export const setLeadFilterOptionsAction = ({ projectId, leadFilterOptions }) => ({
    type: SET_LEAD_FILTER_OPTIONS,
    projectId,
    leadFilterOptions,
});

export const setCountriesAction = ({ countries }) => ({
    type: SET_COUNTRIES,
    countries,
});

export const addNewCountryAction = ({ countryDetail }) => ({
    type: ADD_NEW_COUNTRY,
    countryDetail,
});

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});
