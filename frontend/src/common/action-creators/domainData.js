import {
    SET_USER_INFORMATION,
    UNSET_USER,
    SET_USERS_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT,
    SET_USER_PROJECT_OPTIONS,
    SET_USERS_PROJECT_MEMBERSHIP,
    SET_USER_PROJECT_MEMBERSHIP,
    UNSET_USER_PROJECT_MEMBERSHIP,
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
    SET_ADMIN_LEVELS_FOR_REGION,
    ADD_ADMIN_LEVEL_FOR_REGION,
    UNSET_ADMIN_LEVEL_FOR_REGION,

    SET_LEAD_FILTER_OPTIONS,

    SET_ANALYSIS_FRAMEWORK,
    SET_ANALYSIS_FRAMEWORKS,
    ADD_NEW_AF,
    SET_PROJECT_AF,
    SET_AF_DETAIL,

    SET_CATEGORY,
    ADD_NEW_CATEGORY,
    ADD_NEW_SUBCATEGORY,
    ADD_NEW_SUBSUBCATEGORY,
} from '../action-types/domainData';

export const setUserInformationAction = ({ userId, information }) => ({
    type: SET_USER_INFORMATION,
    userId,
    information,
});

export const unsetUserAction = ({ userId }) => ({
    type: UNSET_USER,
    userId,
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

export const setUsersProjectMembershipAction = ({ projectMembership, projectId }) => ({
    type: SET_USERS_PROJECT_MEMBERSHIP,
    projectMembership,
    projectId,
});

export const setUserProjectMembershipAction = ({ memberDetails, projectId }) => ({
    type: SET_USER_PROJECT_MEMBERSHIP,
    memberDetails,
    projectId,
});

export const unsetUserProjectMembershipAction = ({ memberId, projectId }) => ({
    type: UNSET_USER_PROJECT_MEMBERSHIP,
    memberId,
    projectId,
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

export const setAdminLevelsForRegionAction = ({ adminLevels, regionId }) => ({
    type: SET_ADMIN_LEVELS_FOR_REGION,
    adminLevels,
    regionId,
});

export const addAdminLevelForRegionAction = ({ adminLevel, regionId }) => ({
    type: ADD_ADMIN_LEVEL_FOR_REGION,
    adminLevel,
    regionId,
});

export const unsetAdminLevelForRegionAction = ({ adminLevelId, regionId }) => ({
    type: UNSET_ADMIN_LEVEL_FOR_REGION,
    adminLevelId,
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

export const setAfDetailAction = ({ afId, afDetail }) => ({
    type: SET_AF_DETAIL,
    afId,
    afDetail,
});

export const addNewCategoryAction = ({ category }) => ({
    type: ADD_NEW_CATEGORY,
    category,
});

export const addNewSubCategoryAction = ({ category, subCategory }) => ({
    type: ADD_NEW_SUBCATEGORY,
    category,
    subCategory,
});

export const addNewSubSubCategoryAction = ({ subCategory, subSubCategory }) => ({
    type: ADD_NEW_SUBSUBCATEGORY,
    subCategory,
    subSubCategory,
});

export const setCategoryAction = ({ category }) => ({
    type: SET_CATEGORY,
    category,
});

export const dummyAction = () => ({
    type: DUMMY_ACTION,
});
