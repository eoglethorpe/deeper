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
    ADD_ANALYSIS_FRAMEWORK_WIDGET,
    REMOVE_ANALYSIS_FRAMEWORK_WIDGET,
    UPDATE_ANALYSIS_FRAMEWORK_WIDGET,
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


export const setAnalysisFramework = ({ analysisFramework }) => ({
    type: SET_ANALYSIS_FRAMEWORK,
    analysisFramework,
});

export const addAnalysisFrameworkWidget = ({ analysisFrameworkId, widget }) => ({
    type: ADD_ANALYSIS_FRAMEWORK_WIDGET,
    analysisFrameworkId,
    widget,
});

export const removeAnalysisFrameworkWidget = ({ analysisFrameworkId, widgetId }) => ({
    type: REMOVE_ANALYSIS_FRAMEWORK_WIDGET,
    analysisFrameworkId,
    widgetId,
});

export const updateAnalysisFrameworkWidget = ({ analysisFrameworkId, widget }) => ({
    type: UPDATE_ANALYSIS_FRAMEWORK_WIDGET,
    analysisFrameworkId,
    widget,
});

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});
