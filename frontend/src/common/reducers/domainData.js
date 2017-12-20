import createReducerWithMap from '../utils/createReducerWithMap';
import {
    SET_USER_INFORMATION,
    UNSET_USER,
    SET_USERS_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT_OPTIONS,
    SET_USER_PROJECT,
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

    UNSET_REGION,
    ADD_NEW_REGION,
    REMOVE_PROJECT_REGION,
    SET_REGIONS,
    SET_REGION_DETAILS,
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
import {
    LOGOUT_ACTION,
} from '../reducers/auth';

import initialDomainDataState from '../initial-state/domainData';
import update from '../../public/utils/immutable-update';

const logout = () => initialDomainDataState;

const setUserInformation = (state, action) => {
    const { userId, information } = action;
    const settings = {
        users: {
            [userId]: { $auto: {
                information: { $auto: {
                    $merge: information,
                } },
            } },
        },
    };
    return update(state, settings);
};

const unsetUserInformation = (state, action) => {
    const settings = {
        users: {
            [action.userId]: { $set: undefined },
        },
    };
    return update(state, settings);
};

const setUsersInformation = (state, action) => {
    const { users } = action;

    const userSettings = users.reduce(
        (acc, user) => {
            acc[user.id] = { $auto: {
                information: { $auto: {
                    $merge: user,
                } },
            } };
            return acc;
        },
        {},
    );
    const settings = {
        users: userSettings,
    };
    return update(state, settings);
};

const setUserProject = (state, action) => {
    const { project, userId } = action;
    const settings = {
        projects: {
            [project.id]: { $auto: {
                $merge: project,
            } },
        },
    };

    if (userId) {
        const userProjectArrayIndex = ((state.users[userId] || {}).projects
            || []).indexOf(project.id);

        if (userProjectArrayIndex === -1) {
            settings.users = {
                [userId]: { $auto: {
                    projects: { $autoArray: {
                        $push: [project.id],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const setUserProjectOptions = (state, action) => {
    const { projectId, options } = action;
    const settings = {
        projectsOptions: {
            [projectId]: { $auto: {
                $set: options,
            } },
        },
    };
    return update(state, settings);
};

const setUsersProjectMembership = (state, action) => {
    const { projectId, projectMembership } = action;

    const memberships = ((state.projects[projectId] || {}).memberships || []);
    const newMembers = projectMembership.filter(
        projectMember => (
            memberships.findIndex(member => (member.id === projectMember.id)) === -1
        ),
    );

    const settings = {
        projects: {
            [projectId]: { $auto: {
                memberships: { $autoArray: {
                    $push: newMembers,
                } },
            } },
        },
    };
    return update(state, settings);
};

const setUserProjectMembership = (state, action) => {
    const { projectId, memberDetails } = action;

    const memberships = ((state.projects[projectId] || {}).memberships || []);
    const updatedMemberShipIndex = memberships.findIndex(
        membership => (memberDetails.id === membership.id),
    );

    const settings = {
        projects: {
            [projectId]: { $auto: {
                memberships: { $autoArray: {
                    [updatedMemberShipIndex]: { $auto: {
                        $merge: memberDetails,
                    } },
                } },
            } },
        },
    };
    return update(state, settings);
};

const unsetUserProjectMembership = (state, action) => {
    const { memberId, projectId } = action;

    const memberships = ((state.projects[projectId] || {}).memberships || []);
    const membershipArrayIndex = memberships.findIndex(
        membership => (membership.id === memberId));

    if (membershipArrayIndex !== -1) {
        const settings = {
            projects: {
                [projectId]: { $auto: {
                    memberships: { $autoArray: {
                        $splice: [[membershipArrayIndex, 1]],
                    } },
                } },
            },
        };
        return update(state, settings);
    }
    return state;
};

const unsetUserProject = (state, action) => {
    const { projectId, userId } = action;
    const settings = {
        projects: {
            [projectId]: { $auto: {
                $set: undefined,
            } },
        },
    };

    if (userId) {
        const userProjectArrayIndex = ((state.users[userId] || {}).projects
            || []).indexOf(projectId);

        if (userProjectArrayIndex !== -1) {
            settings.users = {
                [userId]: { $auto: {
                    projects: { $autoArray: {
                        $splice: [[userProjectArrayIndex, 1]],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const setUserProjects = (state, action) => {
    const { projects, userId } = action;

    const projectSettings = projects.reduce(
        (acc, project) => {
            acc[project.id] = { $auto: {
                $set: project,
            } };
            return acc;
        },
        { },
    );

    const settings = {
        projects: projectSettings,
        users: {
            [userId]: { $auto: {
                projects: { $autoArray: {
                    $set: projects.map(project => project.id),
                } },
            } },
        },
    };
    return update(state, settings);
};

const setUserGroups = (state, action) => {
    const { userGroups, userId } = action;

    const userGroupSettings = userGroups.reduce(
        (acc, userGroup) => {
            acc[userGroup.id] = { $auto: {
                $merge: userGroup,
            } };
            return acc;
        },
        {},
    );

    const settings = {
        userGroups: userGroupSettings,
    };

    if (userId) {
        settings.users = {
            [userId]: { $auto: {
                userGroups: { $autoArray: {
                    $set: userGroups.map(userGroup => (
                        userGroup.id
                    )),
                } },
            } },
        };
    }
    return update(state, settings);
};

const setUserGroup = (state, action) => {
    const { userGroup, userId } = action;
    const settings = {
        userGroups: {
            [userGroup.id]: { $auto: {
                $merge: userGroup,
            } },
        },
    };

    if (userId) {
        const userGroupArrayIndex = ((state.users[userId] || {}).userGroups
            || []).indexOf(userGroup.id);

        if (userGroupArrayIndex === -1) {
            settings.users = {
                [userId]: { $auto: {
                    userGroups: { $autoArray: {
                        $push: [userGroup.id],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const unsetUserGroup = (state, action) => {
    const { userGroupId, userId } = action;
    const settings = {
        userGroups: {
            [userGroupId]: { $auto: {
                $set: undefined,
            } },
        },
    };

    if (userId) {
        const userGroupArrayIndex = ((state.users[userId] || {}).userGroups
            || []).indexOf(userGroupId);

        if (userGroupArrayIndex !== -1) {
            settings.users = {
                [userId]: { $auto: {
                    userGroups: { $autoArray: {
                        $splice: [[userGroupArrayIndex, 1]],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const setUsersMembership = (state, action) => {
    const { userGroupId, usersMembership } = action;

    const memberships = ((state.userGroups[userGroupId] || {}).memberships || []);
    const newUsersMemberShip = usersMembership.filter(
        userMembership => (
            memberships.findIndex(member => (member.id === userMembership.id)) === -1
        ),
    );

    const settings = {
        userGroups: {
            [userGroupId]: { $auto: {
                memberships: { $autoArray: {
                    $push: newUsersMemberShip,
                } },
            } },
        },
    };
    return update(state, settings);
};

const setUserMembership = (state, action) => {
    const { userGroupId, userMembership } = action;

    const memberships = ((state.userGroups[userGroupId] || {}).memberships || []);
    const updatedUsersMemberShipIndex = memberships.findIndex(
        membership => (userMembership.id === membership.id),
    );

    const settings = {
        userGroups: {
            [userGroupId]: { $auto: {
                memberships: { $autoArray: {
                    [updatedUsersMemberShipIndex]: { $auto: {
                        $merge: userMembership,
                    } },
                } },
            } },
        },
    };
    return update(state, settings);
};

const unsetUserMembership = (state, action) => {
    const { userGroupId, membershipId } = action;

    const memberships = ((state.userGroups[userGroupId] || {}).memberships || []);
    const groupMembershipArrayIndex = memberships.findIndex(
        membership => (membership.id === membershipId));

    if (groupMembershipArrayIndex !== -1) {
        const settings = {
            userGroups: {
                [userGroupId]: { $auto: {
                    memberships: { $autoArray: {
                        $splice: [[groupMembershipArrayIndex, 1]],
                    } },
                } },
            },
        };
        return update(state, settings);
    }
    return state;
};

const setLeadFilterOptions = (state, action) => {
    const { projectId, leadFilterOptions } = action;
    const settings = {
        leadFilterOptions: {
            [projectId]: { $autoArray: {
                $set: leadFilterOptions,
            } },
        },
    };
    return update(state, settings);
};

const setRegions = (state, action) => {
    const { regions } = action;

    const regionSettings = regions.reduce(
        (acc, region) => {
            acc[region.id] = { $auto: {
                $set: region,
            } };
            return acc;
        },
        {},
    );

    const settings = {
        regions: regionSettings,
    };
    return update(state, settings);
};

const setRegionDetails = (state, action) => {
    const { regionId, regionDetails } = action;
    const settings = {
        regions: {
            [regionId]: { $auto: {
                $merge: regionDetails,
            } },
        },
    };
    return update(state, settings);
};

const unsetRegion = (state, action) => {
    const { regionId } = action;
    const settings = {
        regions: {
            [regionId]: { $auto: {
                $set: undefined,
            } },
        },
    };
    return update(state, settings);
};

const removeProjectRegion = (state, action) => {
    const { projectId, regionId } = action;

    const settings = {};
    const index = ((state.projects[projectId] || {}).regions
        || []).findIndex(d => (d.id === regionId));

    if (index !== -1) {
        settings.projects = {
            [projectId]: { $auto: {
                regions: { $autoArray: {
                    $splice: [[index, 1]],
                } },
            } },
        };
    }
    return update(state, settings);
};

const addNewRegion = (state, action) => {
    const { regionDetail, projectId } = action;
    const settings = {
        regions: { $auto: {
            [regionDetail.id]: { $auto: {
                $merge: regionDetail,
            } },
        } },
    };
    if (projectId) {
        const index = ((state.projects[projectId] || {}).regions
            || []).findIndex(d => (d.id === regionDetail.id));
        if (index === -1) {
            settings.projects = {
                [projectId]: { $auto: {
                    regions: { $autoArray: {
                        $push: [{
                            id: regionDetail.id,
                            title: regionDetail.title,
                        }],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const setAdminLevelsForRegion = (state, action) => {
    const { adminLevels, regionId } = action;
    const settings = {
        adminLevels: { $auto: {
            [regionId]: { $autoArray: {
                $set: adminLevels,
            } },
        } },
    };
    return update(state, settings);
};

const addAdminLevelForRegion = (state, action) => {
    const { adminLevel, regionId } = action;
    const index = (state.adminLevels[regionId]
        || []).findIndex(d => (d.id === adminLevel.id));

    let settings = {};
    if (index === -1) {
        settings = {
            adminLevels: { $auto: {
                [regionId]: { $autoArray: {
                    $push: [adminLevel],
                } },
            } },
        };
    } else {
        settings = {
            adminLevels: { $auto: {
                [regionId]: { $autoArray: {
                    $splice: [[index, 1, adminLevel]],
                } },
            } },
        };
    }
    return update(state, settings);
};

const removeAdminLevelForRegion = (state, action) => {
    const { adminLevelId, regionId } = action;
    const index = (state.adminLevels[regionId]
        || []).findIndex(d => (d.id === adminLevelId));

    let settings = {};
    if (index !== -1) {
        settings = {
            adminLevels: { $auto: {
                [regionId]: { $autoArray: {
                    $splice: [[index, 1]],
                } },
            } },
        };
    }
    return update(state, settings);
};

const setAnalysisFramework = (state, action) => {
    const { analysisFramework } = action;
    const settings = {
        analysisFrameworks: { $auto: {
            [analysisFramework.id]: { $auto: {
                $merge: analysisFramework,
            } },
        } },
    };
    return update(state, settings);
};

const setAnalysisFrameworks = (state, action) => {
    const { analysisFrameworks } = action;

    const keysOfState = Object.keys(state.analysisFrameworks);
    // Get keys to be removed
    // NOTE: Remove all keys except those to be merged
    const keysToRemove = keysOfState.filter(
        key => analysisFrameworks.findIndex(f => f.id === +key) < 0,
    );

    // Merge
    const analysisFrameworksSettings = analysisFrameworks.reduce(
        (acc, analysisFramework) => {
            acc[analysisFramework.id] = { $auto: {
                $merge: analysisFramework,
            } };
            return acc;
        },
        {},
    );

    // Remove
    const analysisFrameworksSettings2 = keysToRemove.reduce(
        (acc, key) => {
            acc[key] = { $set: undefined };
            return acc;
        },
        { ...analysisFrameworksSettings },
    );

    const settings = {
        analysisFrameworks: analysisFrameworksSettings2,
    };
    return update(state, settings);
};

const addNewAf = (state, action) => {
    const { afDetail, projectId } = action;
    const settings = {
        analysisFrameworks: { $auto: {
            [afDetail.id]: { $auto: {
                $merge: afDetail,
            } },
        } },
    };
    settings.projects = {
        [projectId]: { $auto: {
            analysisFramework: {
                $set: afDetail.id,
            },
        } },
    };
    return update(state, settings);
};

const setProjectAf = (state, action) => {
    const { projectId, afId } = action;
    const settings = {
        projects: { $auto: {
            [projectId]: { $auto: {
                analysisFramework: {
                    $set: afId,
                },
            } },
        } },
    };
    return update(state, settings);
};

const setAfDetail = (state, action) => {
    const { afId, afDetail } = action;
    const settings = {
        analysisFrameworks: {
            [afId]: { $auto: {
                $merge: afDetail,
            } },
        },
    };
    return update(state, settings);
};

const addNewCategory = (state, action) => {
    const settings = {
        categories: { $auto: {
            [action.category.id]: { $auto: {
                $merge: action.category,
            } },
        } },
    };
    return update(state, settings);
};

const addNewSubCategory = (state, action) => {
    const { category, subCategory } = action;
    const index = ((state.categories[category.id] || {}).subCategories
        || []).findIndex(sC => sC === subCategory.id);

    const settings = {
        subCategories: { $auto: {
            [subCategory.id]: { $auto: {
                $merge: subCategory,
            } },
        } },
    };

    if (category && index === -1) {
        settings.categories = {
            $auto: {
                [category.id]: { $auto: {
                    subCategories: { $autoArray: {
                        $push: [subCategory.id],
                    } },
                } },
            },
        };
    }
    return update(state, settings);
};

const addNewSubSubCategory = (state, action) => {
    const { subCategory, subSubCategory } = action;
    const index = ((state.subCategories[subSubCategory.id] || {}).subSubCategories
        || []).findIndex(sC => sC === subSubCategory.id);

    const settings = {
        subSubCategories: { $auto: {
            [subSubCategory.id]: { $auto: {
                $merge: subSubCategory,
            } },
        } },
    };

    if (subCategory && index === -1) {
        settings.subCategories = {
            $auto: {
                [subCategory.id]: { $auto: {
                    subSubCategories: { $autoArray: {
                        $push: [subSubCategory.id],
                    } },
                } },
            },
        };
    }
    return update(state, settings);
};

const setCategory = (state, action) => {
    const rCategory = { ...action.category };
    const subCategories = action.category.subCategories;

    const rSubSubCategories = {};
    let rSubCategories;

    if (subCategories) {
        rCategory.subCategories = subCategories.map(sC => sC.id);

        rSubCategories = subCategories.reduce((ac, sC) => {
            const rSubCategory = { ...sC };
            const subSubCategories = sC.subSubCategories;

            if (subSubCategories) {
                rSubCategory.subSubCategories = subSubCategories.map((ssC) => {
                    rSubSubCategories[ssC.id] = { $auto: {
                        $merge: ssC,
                    } };
                    return ssC.id;
                });
            }

            return {
                ...ac,
                [sC.id]: { $auto: {
                    $merge: rSubCategory,
                } },
            };
        }, {});
    }

    const settings = {
        categories: { $auto: {
            [rCategory.id]: { $auto: {
                $merge: rCategory,
            } },
        } },
    };

    if (subCategories) {
        settings.subCategories = { $auto: rSubCategories };
    }

    if (Object.keys(rSubSubCategories)) {
        settings.subSubCategories = { $auto: rSubSubCategories };
    }

    return update(state, settings);
};

const dummyAction = (state) => {
    const dummy = {
        id: 1,
        createdOn: 17263871623,
        createdBy: 'Frozen Helium',
        title: 'If someone bit by a vampire turns into one when they die, how long until everyone is vampires?',
        published: 1230129312,
        confidentiality: 'Non-Confidential',
        source: 'https://facebook.com',
        numberOfEntries: 12,
        status: 'Pending',
        actions: 'GG WP',
    };
    const settings = {
        leads: {
            $splice: [[0, 1, dummy]],
        },
    };
    return update(state, settings);
};

const reducers = {
    [LOGOUT_ACTION]: logout,

    [DUMMY_ACTION]: dummyAction,

    [SET_USER_INFORMATION]: setUserInformation,
    [UNSET_USER]: unsetUserInformation,
    [SET_USERS_INFORMATION]: setUsersInformation,

    [SET_USER_PROJECTS]: setUserProjects,
    [SET_USER_PROJECT]: setUserProject,
    [UNSET_USER_PROJECT]: unsetUserProject,
    [SET_USER_PROJECT_OPTIONS]: setUserProjectOptions,
    [SET_USERS_PROJECT_MEMBERSHIP]: setUsersProjectMembership,
    [SET_USER_PROJECT_MEMBERSHIP]: setUserProjectMembership,
    [UNSET_USER_PROJECT_MEMBERSHIP]: unsetUserProjectMembership,

    [SET_USER_GROUP]: setUserGroup,
    [SET_USER_GROUPS]: setUserGroups,
    [UNSET_USER_GROUP]: unsetUserGroup,

    [SET_USERS_MEMBERSHIP]: setUsersMembership,
    [SET_USER_MEMBERSHIP]: setUserMembership,
    [UNSET_USER_MEMBERSHIP]: unsetUserMembership,

    [SET_LEAD_FILTER_OPTIONS]: setLeadFilterOptions,

    [SET_REGIONS]: setRegions,
    [SET_REGION_DETAILS]: setRegionDetails,

    [UNSET_REGION]: unsetRegion,
    [REMOVE_PROJECT_REGION]: removeProjectRegion,
    [ADD_NEW_REGION]: addNewRegion,
    [SET_ADMIN_LEVELS_FOR_REGION]: setAdminLevelsForRegion,
    [ADD_ADMIN_LEVEL_FOR_REGION]: addAdminLevelForRegion,
    [UNSET_ADMIN_LEVEL_FOR_REGION]: removeAdminLevelForRegion,

    [SET_ANALYSIS_FRAMEWORK]: setAnalysisFramework,
    [SET_ANALYSIS_FRAMEWORKS]: setAnalysisFrameworks,
    [ADD_NEW_AF]: addNewAf,
    [SET_PROJECT_AF]: setProjectAf,
    [SET_AF_DETAIL]: setAfDetail,

    [ADD_NEW_CATEGORY]: addNewCategory,
    [ADD_NEW_SUBCATEGORY]: addNewSubCategory,
    [ADD_NEW_SUBSUBCATEGORY]: addNewSubSubCategory,
    [SET_CATEGORY]: setCategory,
};

const domainDataReducer = createReducerWithMap(reducers, initialDomainDataState);
export default domainDataReducer;
