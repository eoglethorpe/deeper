import {
    SET_USER_INFORMATION,
    SET_USER_PROJECTS,
    SET_ACTIVE_PROJECT,
    SET_LEADS,
    DUMMY_ACTION,
} from '../action-types/domainData';

import initialDomainDataState from '../initial-state/domainData';
import update from '../../public/utils/immutable-update';

const domainDataReducer = (state = initialDomainDataState, action) => {
    switch (action.type) {
        case SET_USER_INFORMATION: {
            const settings = {
                users: {
                    [action.userId]: { $auto: {
                        information: {
                            $set: action.information,
                        },
                    } },
                },
            };
            return update(state, settings);
        }
        case SET_USER_PROJECTS: {
            const settings = {
                users: {
                    [action.userId]: { $auto: {
                        projects: {
                            $set: action.projects,
                        },
                    } },
                },
            };
            return update(state, settings);
        }
        case SET_LEADS: {
            const settings = {
                leads: {
                    [action.projectId]: { $autoArray: {
                        $set: action.leads,
                    } },
                },
            };
            console.log(settings);
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
