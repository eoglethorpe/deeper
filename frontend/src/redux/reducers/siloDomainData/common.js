import update from '../../../vendor/react-store/utils/immutable-update';

import { LOGOUT_ACTION } from '../../reducers/auth';
import { SET_USER_PROJECTS } from '../../reducers/domainData/projects';

import initialSiloDomainData from '../../initial-state/siloDomainData';

// TYPE

export const SET_ACTIVE_PROJECT = 'domain-data/SET_ACTIVE_PROJECT';
export const SET_ACTIVE_COUNTRY = 'domain-data/SET_ACTIVE_COUNTRY';

// ACTION-CREATOR

export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const setActiveCountryAction = ({ activeCountry }) => ({
    type: SET_ACTIVE_COUNTRY,
    activeCountry,
});

const getIdFromProject = project => project.id;

// REDUCER

const logout = () => initialSiloDomainData;

// NOTE: Only set new active project in this reducer
const setUserProjects = (state, action) => {
    const { activeProject } = state;
    const { projects } = action;

    // if projects, try to find purano else naya

    let newActiveProjectId;
    if (projects && projects.length > 0) {
        const indexOfActiveProject = projects.findIndex(
            project => getIdFromProject(project) === activeProject,
        );
        if (indexOfActiveProject === -1) {
            newActiveProjectId = getIdFromProject(projects[0]);
        } else {
            // it hasn't changed
            newActiveProjectId = activeProject;
        }
    }

    const settings = {
        activeProject: { $set: newActiveProjectId },
    };
    return update(state, settings);
};

const setActiveProject = (state, action) => {
    const { activeProject } = action;
    const settings = {
        activeProject: { $set: activeProject },
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
