import {
    SET_USER_INFORMATION,
    SET_USERS_INFORMATION,
    SET_USER_PROJECTS,
    SET_USER_PROJECT,
    UNSET_USER_PROJECT,
    SET_USER_GROUPS,
    SET_USER_GROUP,
    UNSET_USER_GROUP,
    DUMMY_ACTION,
    SET_ACTIVE_PROJECT,
    SET_ACTIVE_COUNTRY,
    ADD_NEW_COUNTRY,
    SET_COUNTRIES,
    SET_LEADS,
    SET_LEAD_FILTER_OPTIONS,
} from '../action-types/domainData';
import {
    activeProjectSelector,
} from '../selectors/domainData';

import initialDomainDataState from '../initial-state/domainData';
import update from '../../public/utils/immutable-update';

const domainDataReducer = (state = initialDomainDataState, action) => {
    switch (action.type) {
        case SET_USER_INFORMATION: {
            const settings = {
                users: {
                    [action.userId]: { $auto: {
                        information: {
                            $merge: action.information,
                        },
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
            let activeProject = activeProjectSelector({ domainData: state });
            if (action.projects && action.projects.length > 0) {
                const key = action.projects.findIndex(project => project.id === activeProject);
                if (key < 0) {
                    activeProject = action.projects[0].id;
                }
            }

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
                activeProject: {
                    $set: activeProject,
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
        case SET_LEADS: {
            const settings = {
                leads: {
                    [action.projectId]: { $autoArray: {
                        $set: action.leads,
                    } },
                },
                totalLeadsCount: {
                    [action.projectId]: { $auto: {
                        $set: action.totalLeadsCount,
                    } },
                },
            };

            return update(state, settings);
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
        case SET_COUNTRIES: {
            const settings = {
                countries: {
                    $set: action.countries,
                },
            };
            return update(state, settings);
        }
        case SET_ACTIVE_PROJECT: {
            const settings = {
                activeProject: {
                    $set: action.activeProject,
                },
            };
            return update(state, settings);
        }
        case SET_ACTIVE_COUNTRY: {
            const settings = {
                activeCountry: {
                    $set: action.activeCountry,
                },
            };
            return update(state, settings);
        }
        case ADD_NEW_COUNTRY: {
            const settings = {
                countries: { $autoArray: {
                    $push: [action.countryDetail],
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
        default:
            return state;
    }
};

export default domainDataReducer;
