import {
    SET_USER_INFORMATION,
    SET_USERS_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT,
    SET_USER_PROJECT_OPTIONS,
    UNSET_USER_PROJECT,

    SET_USER_GROUPS,
    SET_USER_GROUP,
    UNSET_USER_GROUP,

    SET_USERS_MEMBERSHIP,
    SET_USER_MEMBERSHIP,
    UNSET_USER_MEMBERSHIP,

    DUMMY_ACTION,

    SET_REGIONS,
    SET_REGION_DETAILS,
    ADD_NEW_REGION,
    REMOVE_PROJECT_REGION,
    UNSET_REGION,

    SET_LEAD_FILTER_OPTIONS,

    SET_ANALYSIS_FRAMEWORK,
    SET_ANALYSIS_FRAMEWORKS,
    ADD_NEW_AF,
    SET_PROJECT_AF,

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

export const setProjectOptionsAction = ({ projectId, options }) => ({
    type: SET_USER_PROJECT_OPTIONS,
    projectId,
    options,
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

export const setUserMembershipAction = ({ userMembership, userGroupId }) => ({
    type: SET_USER_MEMBERSHIP,
    userMembership,
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

export const setLeadFilterOptionsAction = ({ projectId, leadFilterOptions }) => ({
    type: SET_LEAD_FILTER_OPTIONS,
    projectId,
    leadFilterOptions,
});

export const setRegionDetailsAction = ({ regionDetails, regionId }) => ({
    type: SET_REGION_DETAILS,
    regionId,
    regionDetails,
});

export const setRegionsAction = ({ regions }) => ({
    type: SET_REGIONS,
    regions,
});

export const addNewRegionAction = ({ regionDetail, projectId }) => ({
    type: ADD_NEW_REGION,
    regionDetail,
    projectId,
});

export const removeProjectRegionAction = ({ projectId, regionId }) => ({
    type: REMOVE_PROJECT_REGION,
    projectId,
    regionId,
});

export const setAnalysisFrameworkAction = ({ analysisFramework }) => ({
    type: SET_ANALYSIS_FRAMEWORK,
    analysisFramework,
});

export const setAnalysisFrameworksAction = ({ analysisFrameworks }) => ({
    type: SET_ANALYSIS_FRAMEWORKS,
    analysisFrameworks,
});

export const addNewAfAction = ({ afDetail, projectId }) => ({
    type: ADD_NEW_AF,
    afDetail,
    projectId,
});

export const setProjectAfAction = ({ projectId, afId }) => ({
    type: SET_PROJECT_AF,
    projectId,
    afId,
});

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});

