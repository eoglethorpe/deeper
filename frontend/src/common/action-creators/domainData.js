import {
    SET_USER_INFORMATION,
    SET_USERS_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT,
    UNSET_USER_PROJECT,
    SET_USER_GROUPS,
    SET_USER_GROUP,
    UNSET_USER_GROUP,
    SET_USERS_MEMBERSHIP,
    UNSET_USER_MEMBERSHIP,
    DUMMY_ACTION,
    SET_REGIONS,
    ADD_NEW_REGION,
    UNSET_REGION,
    SET_LEADS,
    SET_LEAD_FILTER_OPTIONS,
} from '../action-types/domainData';

export const setUserInformationAction = ({ userId, information }) => ({
    type: SET_USER_INFORMATION,
    userId,
    information,
});

export const setUsersInformationAction = ({ users }) => ({
    type: SET_USERS_INFORMATION,
    users,
});

export const setUserProjectsAction = ({ userId, projects }) => ({
    type: SET_USER_PROJECTS,
    userId,
    projects,
});

export const setProjectAction = ({ userId, project }) => ({
    type: SET_USER_PROJECT,
    userId,
    project,
});
export const unSetProjectAction = ({ userId, projectId }) => ({
    type: UNSET_USER_PROJECT,
    userId,
    projectId,
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

export const unSetUserGroupAction = ({ userId, userGroupId }) => ({
    type: UNSET_USER_GROUP,
    userId,
    userGroupId,
});

export const setUsersMembershipAction = ({ usersMembership, userGroupId }) => ({
    type: SET_USERS_MEMBERSHIP,
    usersMembership,
    userGroupId,
});

export const unSetMembershipAction = ({ membershipId, userGroupId }) => ({
    type: UNSET_USER_MEMBERSHIP,
    membershipId,
    userGroupId,
});

export const unSetRegionAction = ({ regionId }) => ({
    type: UNSET_REGION,
    regionId,
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

export const setRegionsAction = ({ regions }) => ({
    type: SET_REGIONS,
    regions,
});

export const addNewRegionAction = ({ regionDetail }) => ({
    type: ADD_NEW_REGION,
    regionDetail,
});

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});
