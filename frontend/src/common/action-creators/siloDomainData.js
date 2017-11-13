import {
    SET_ACTIVE_PROJECT,
    SET_ACTIVE_COUNTRY,
} from '../action-types/siloDomainData';


export const setActiveProjectAction = ({ activeProject }) => ({
    type: SET_ACTIVE_PROJECT,
    activeProject,
});

export const setActiveCountryAction = ({ activeCountry }) => ({
    type: SET_ACTIVE_COUNTRY,
    activeCountry,
});
