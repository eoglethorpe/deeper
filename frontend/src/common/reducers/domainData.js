import {
    SET_USER_INFORMATION,
    SET_USERS_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT_OPTIONS,
    SET_USER_PROJECT,
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

    SET_LEAD_FILTER_OPTIONS,

    SET_ANALYSIS_FRAMEWORK,
    ADD_ENTRY,
    REMOVE_ENTRY,
    SET_ACTIVE_ENTRY,
} from '../action-types/domainData';

import initialDomainDataState from '../initial-state/domainData';
import update from '../../public/utils/immutable-update';

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

const setUserMemebership = (state, action) => {
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

const addEntry = (state, action) => {
    const { entry, leadId } = action;
    console.warn('Creating new', entry.id);

    const settings = {
        entries: { $auto: {
            [leadId]: { $autoArray: {
                $push: [entry],
            } },
        } },
        selectedEntryId: { $set: entry.id },
    };

    return update(state, settings);
};

const setActiveEntry = (state, action) => {
    const { entryId } = action;
    console.warn('Setting Active', entryId);
    const settings = {
        selectedEntryId: { $set: entryId },
    };
    return update(state, settings);
};

const removeEntry = (state, action) => {
    const { entryId, leadId } = action;
    const entryIndex = state.entries[leadId].findIndex(d => d.id === entryId);

    console.warn('Removing', entryId);
    let newActiveId;
    if (entryIndex - 1 >= 0) {
        newActiveId = state.entries[leadId][entryIndex - 1].id;
    } else if (entryIndex + 1 < state.entries[leadId].length) {
        newActiveId = state.entries[leadId][entryIndex + 1].id;
    }
    console.warn('Setting new', newActiveId);

    const settings = {
        entries: { $auto: {
            [leadId]: { $autoArray: {
                $splice: [[entryIndex, 1]],
            } },
        } },
        selectedEntryId: { $set: newActiveId },
    };

    return update(state, settings);
};

const reducers = {
    [DUMMY_ACTION]: dummyAction,

    [SET_USER_INFORMATION]: setUserInformation,
    [SET_USERS_INFORMATION]: setUsersInformation,

    [SET_USER_PROJECTS]: setUserProjects,
    [SET_USER_PROJECT]: setUserProject,
    [UNSET_USER_PROJECT]: unsetUserProject,
    [SET_USER_PROJECT_OPTIONS]: setUserProjectOptions,

    [SET_USER_GROUP]: setUserGroup,
    [SET_USER_GROUPS]: setUserGroups,
    [UNSET_USER_GROUP]: unsetUserGroup,

    [SET_USERS_MEMBERSHIP]: setUsersMembership,
    [SET_USER_MEMBERSHIP]: setUserMemebership,
    [UNSET_USER_MEMBERSHIP]: unsetUserMembership,

    [SET_LEAD_FILTER_OPTIONS]: setLeadFilterOptions,

    [SET_REGIONS]: setRegions,
    [SET_REGION_DETAILS]: setRegionDetails,
    [UNSET_REGION]: unsetRegion,
    [REMOVE_PROJECT_REGION]: removeProjectRegion,
    [ADD_NEW_REGION]: addNewRegion,

    [SET_ANALYSIS_FRAMEWORK]: setAnalysisFramework,

    [ADD_ENTRY]: addEntry,
    [REMOVE_ENTRY]: removeEntry,
    [SET_ACTIVE_ENTRY]: setActiveEntry,
};

const domainDataReducer = (state = initialDomainDataState, action) => {
    const { type } = action;
    const reducer = reducers[type];
    if (!reducer) {
        return state;
    }
    return reducer(state, action);
};

export default domainDataReducer;
