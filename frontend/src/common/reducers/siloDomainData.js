import {
    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,
} from '../action-types/siloDomainData';

import {
    SET_USER_PROJECTS,
} from '../action-types/domainData';

import {
    activeProjectSelector,
} from '../selectors/siloDomainData';

import initialSiloDomainData from '../initial-state/siloDomainData';
import update from '../../public/utils/immutable-update';

const siloDomainDataReducer = (state = initialSiloDomainData, action) => {
    switch (action.type) {
        case SET_ACTIVE_PROJECT: {
            const settings = {
                activeProject: {
                    $set: action.activeProject,
                },
            };
            return update(state, settings);
        }
        case SET_USER_PROJECTS: {
            let activeProject = activeProjectSelector({ siloDomainData: state });
            if (action.projects && action.projects.length > 0) {
                const key = action.projects.findIndex(project => project.id === activeProject);
                if (key < 0) {
                    activeProject = action.projects[0].id;
                }
            }

            const settings = {
                activeProject: {
                    $set: activeProject,
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
        default:
            return state;
    }
};

export default siloDomainDataReducer;
