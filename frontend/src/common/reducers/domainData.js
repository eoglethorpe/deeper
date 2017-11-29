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

    UNSET_REGION,
    ADD_NEW_REGION,
    REMOVE_PROJECT_REGION,
    SET_REGIONS,
    SET_REGION_DETAILS,

    SET_LEAD_FILTER_OPTIONS,

    SET_ANALYSIS_FRAMEWORK,
    ADD_ENTRY,
    REMOVE_ENTRY,
} from '../action-types/domainData';

import initialDomainDataState from '../initial-state/domainData';
import update from '../../public/utils/immutable-update';

const domainDataReducer = (state = initialDomainDataState, action) => {
    switch (action.type) {
        case SET_USER_INFORMATION: {
            const settings = {
                users: {
                    [action.userId]: { $auto: {
                        information: { $auto: {
                            $merge: action.information,
                        } },
                    } },
                },
            };
            return update(state, settings);
        }
        case SET_USERS_INFORMATION: {
            const users = action.users.reduce(
                (acc, user) => (
                    {
                        ...acc,
                        [user.id]: { $auto: {
                            information: { $auto: {
                                $merge: user,
                            } },
                        } },
                    }
                ),
                {},
            );
            const settings = {
                users,
            };
            return update(state, settings);
        }

        case SET_USER_PROJECT: {
            const settings = {
                projects: {
                    [action.project.id]: { $auto: {
                        $merge: action.project,
                    } },
                },
            };

            if (action.userId) {
                const userProjectArrayIndex = ((state.users[action.userId] || {}).projects
                    || []).indexOf(action.project.id);

                if (userProjectArrayIndex === -1) {
                    settings.users = {
                        [action.userId]: { $auto: {
                            projects: { $autoArray: {
                                $push: [action.project.id],
                            } },
                        } },
                    };
                }
            }
            return update(state, settings);
        }

        case UNSET_USER_PROJECT: {
            const settings = {
                projects: {
                    [action.projectId]: { $auto: {
                        $set: undefined,
                    } },
                },
            };

            if (action.userId) {
                const userProjectArrayIndex = ((state.users[action.userId] || {}).projects
                    || []).indexOf(action.projectId);

                if (userProjectArrayIndex !== -1) {
                    settings.users = {
                        [action.userId]: { $auto: {
                            projects: { $autoArray: {
                                $splice: [[userProjectArrayIndex, 1]],
                            } },
                        } },
                    };
                }
            }
            return update(state, settings);
        }
        case SET_USER_PROJECTS: {
            const projects = action.projects.reduce((acc, project) => (
                {
                    ...acc,
                    [project.id]: { $auto: {
                        $set: project,
                    } },
                }
            ), {});

            const settings = {
                projects,
                users: {
                    [action.userId]: { $auto: {
                        projects: { $autoArray: {
                            $set: action.projects.map(project => project.id),
                        } },
                    } },
                },
            };
            return update(state, settings);
        }
        case SET_USER_GROUPS: {
            const userGroups = action.userGroups.reduce(
                (acc, userGroup) => (
                    {
                        ...acc,
                        [userGroup.id]: { $auto: {
                            $merge: userGroup,
                        } },
                    }
                ), {});
            const settings = {
                userGroups,
            };
            if (action.userId) {
                settings.users = {
                    [action.userId]: { $auto: {
                        userGroups: { $autoArray: {
                            $set: action.userGroups.map(userGroup => (
                                userGroup.id
                            )),
                        } },
                    } },
                };
            }
            return update(state, settings);
        }
        case SET_USER_GROUP: {
            const settings = {
                userGroups: {
                    [action.userGroup.id]: { $auto: {
                        $merge: action.userGroup,
                    } },
                },
            };

            if (action.userId) {
                const userGroupArrayIndex = ((state.users[action.userId] || {}).userGroups
                    || []).indexOf(action.userGroup.id);

                if (userGroupArrayIndex === -1) {
                    settings.users = {
                        [action.userId]: { $auto: {
                            userGroups: { $autoArray: {
                                $push: [action.userGroup.id],
                            } },
                        } },
                    };
                }
            }
            return update(state, settings);
        }
        case UNSET_USER_GROUP: {
            const settings = {
                userGroups: {
                    [action.userGroupId]: { $auto: {
                        $set: undefined,
                    } },
                },
            };

            if (action.userId) {
                const userGroupArrayIndex = ((state.users[action.userId] || {}).userGroups
                    || []).indexOf(action.userGroupId);

                if (userGroupArrayIndex !== -1) {
                    settings.users = {
                        [action.userId]: { $auto: {
                            userGroups: { $autoArray: {
                                $splice: [[userGroupArrayIndex, 1]],
                            } },
                        } },
                    };
                }
            }
            return update(state, settings);
        }
        case SET_USERS_MEMBERSHIP: {
            const memberships = ((state.userGroups[action.userGroupId] || {}).memberships || []);
            const newUsersMemberShip = action.usersMembership.filter(
                userMembership => (
                    memberships.findIndex(member => (member.id === userMembership.id)) === -1
                ),
            );

            const settings = {
                userGroups: {
                    [action.userGroupId]: { $auto: {
                        memberships: { $autoArray: {
                            $push: newUsersMemberShip,
                        } },
                    } },
                },
            };
            return update(state, settings);
        }
        case SET_USER_MEMBERSHIP: {
            const memberships = ((state.userGroups[action.userGroupId] || {}).memberships || []);
            const updatedUsersMemberShipIndex = memberships.findIndex(
                userMembership => (
                    action.userMembership.id === userMembership.id
                ),
            );

            const settings = {
                userGroups: {
                    [action.userGroupId]: { $auto: {
                        memberships: { $autoArray: {
                            [updatedUsersMemberShipIndex]: { $auto: {
                                $merge: action.userMembership,
                            } },
                        } },
                    } },
                },
            };
            return update(state, settings);
        }
        case UNSET_USER_MEMBERSHIP: {
            const memberships = ((state.userGroups[action.userGroupId] || {}).memberships || []);
            const groupMembershipArrayIndex = memberships.findIndex(
                membership => (membership.id === action.membershipId));

            if (groupMembershipArrayIndex !== -1) {
                const settings = {
                    userGroups: {
                        [action.userGroupId]: { $auto: {
                            memberships: { $autoArray: {
                                $splice: [[groupMembershipArrayIndex, 1]],
                            } },
                        } },
                    },
                };
                return update(state, settings);
            }
            return state;
        }

        case SET_LEAD_FILTER_OPTIONS: {
            const settings = {
                leadFilterOptions: {
                    [action.projectId]: { $autoArray: {
                        $set: action.leadFilterOptions,
                    } },
                },
            };
            return update(state, settings);
        }

        case SET_REGIONS: {
            const regions = action.regions.reduce((acc, region) => (
                {
                    ...acc,
                    [region.id]: { $auto: {
                        $set: region,
                    } },
                }
            ), {});

            const settings = {
                regions,
            };
            return update(state, settings);
        }

        case SET_REGION_DETAILS: {
            const settings = {
                regions: {
                    [action.regionId]: { $auto: {
                        $merge: action.regionDetails,
                    } },
                },
            };
            return update(state, settings);
        }

        case UNSET_REGION: {
            const settings = {
                regions: {
                    [action.regionId]: { $auto: {
                        $set: undefined,
                    } },
                },
            };
            return update(state, settings);
        }

        case REMOVE_PROJECT_REGION: {
            const settings = {};
            const index = ((state.projects[action.projectId] || {}).regions
                || []).findIndex(d => (d.id === action.regionId));

            if (index !== -1) {
                settings.projects = {
                    [action.projectId]: { $auto: {
                        regions: { $autoArray: {
                            $splice: [[index, 1]],
                        } },
                    } },
                };
            }
            return update(state, settings);
        }

        case ADD_NEW_REGION: {
            const settings = {
                regions: { $auto: {
                    [action.regionDetail.id]: { $auto: {
                        $merge: action.regionDetail,
                    } },
                } },
            };
            if (action.projectId) {
                const index = ((state.projects[action.projectId] || {}).regions
                    || []).findIndex(d => (d.id === action.regionDetail.id));
                if (index === -1) {
                    settings.projects = {
                        [action.projectId]: { $auto: {
                            regions: { $autoArray: {
                                $push: [{
                                    id: action.regionDetail.id,
                                    title: action.regionDetail.title,
                                }],
                            } },
                        } },
                    };
                }
            }
            return update(state, settings);
        }

        case SET_ANALYSIS_FRAMEWORK: {
            const settings = {
                analysisFrameworks: { $auto: {
                    [action.analysisFramework.id]: { $auto: {
                        $merge: action.analysisFramework,
                    } },
                } },
            };
            return update(state, settings);
        }

        case DUMMY_ACTION: {
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
        }

        case ADD_ENTRY: {
            const entry = action.entry;
            const leadId = action.leadId;

            const settings = {
                entries: { $auto: {
                    [leadId]: { $autoArray: {
                        $push: [entry],
                    } },
                } },
            };

            return update(state, settings);
        }

        case REMOVE_ENTRY: {
            const entryId = action.entryId;
            const leadId = action.leadId;

            const entryIndex = state.entries[leadId].findIndex(
                d => d.id === entryId,
            );

            const settings = {
                entries: { $auto: {
                    [leadId]: { $autoArray: {
                        $splice: [[entryIndex, 1]],
                    } },
                } },
            };

            return update(state, settings);
        }

        default:
            return state;
    }
};

export default domainDataReducer;
