import update from '../../../public/utils/immutable-update';
import {
    SET_ACTIVE_COUNTRY,
    SET_ACTIVE_PROJECT,
} from '../../action-types/siloDomainData';
import { LOGOUT_ACTION } from '../../action-types/auth';
import { SET_USER_PROJECTS } from '../../action-types/domainData';

import initialSiloDomainData from '../../initial-state/siloDomainData';

// REDUCER

const logout = () => initialSiloDomainData;

const setActiveProject = (state, action) => {
    const { activeProject } = action;
    const settings = {
        activeProject: {
            $set: activeProject,
        },
    };
    return update(state, settings);
};

// Only set new active project in this reducer
const setUserProjects = (state, action) => {
    const { activeProject } = state;
    const { projects } = action;
    // If there is no projects, then no need to update active project
    if (!projects || projects.length <= 0) {
        return state;
    }

    let activeIndex = action.projects.findIndex(project => project.id === activeProject);
    if (activeIndex < 0) {
        activeIndex = 0;
    }

    const settings = {
        activeProject: { $set: action.projects[activeIndex].id },
    };
    return update(state, settings);
};

const setActiveCountry = (state, action) => {
    const { activeCountry } = action;
    const settings = {
        activeCountry: { $set: activeCountry },
    };
    return update(state, settings);
};

const reducers = {
    [LOGOUT_ACTION]: logout,
    [SET_USER_PROJECTS]: setUserProjects,
    [SET_ACTIVE_PROJECT]: setActiveProject,
    [SET_ACTIVE_COUNTRY]: setActiveCountry,
};
export default reducers;
