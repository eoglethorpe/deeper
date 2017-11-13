import { createSelector } from 'reselect';
import {
    countriesSelector,
    currentUserProjectsSelector,
    leadFilterOptionsSelector,
    leadsSelector,
    projectsSelector,
    totalLeadsCountSelector,
} from './domainData';


// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

// Using state

export const activeProjectSelector = ({ siloDomainData }) => (
    siloDomainData.activeProject
);

export const activeCountrySelector = ({ siloDomainData }) => (
    siloDomainData.activeCountry
);

// FIXME: rename to countryDetailForCountrySelector
export const countryDetailSelector = createSelector(
    countriesSelector,
    activeCountrySelector,
    (countries, activeCountry) => (
        countries.find(country => country.id === activeCountry) || emptyObject
    ),
);

export const projectDetailsSelector = createSelector(
    projectsSelector,
    activeProjectSelector,
    (projects, activeProject) => projects[activeProject] || emptyObject,
);

// Selector depending on project id from state (active project)

export const leadsForProjectSelector = createSelector(
    activeProjectSelector,
    leadsSelector,
    (activeProject, leads) => (leads[activeProject] || emptyList),
);

export const totalLeadsCountForProjectSelector = createSelector(
    activeProjectSelector,
    totalLeadsCountSelector,
    (activeProject, totalLeadsCount) => (totalLeadsCount[activeProject] || 0),
);

export const leadFilterOptionsForProjectSelector = createSelector(
    activeProjectSelector,
    leadFilterOptionsSelector,
    (activeProject, leadFilterOptions) => (leadFilterOptions[activeProject] || emptyObject),
);

// Selector depending on user id from state (logged-in user)
// and on project id from state (active project)

export const currentUserActiveProjectSelector = createSelector(
    currentUserProjectsSelector,
    activeProjectSelector,
    (currentUserProjects, activeProject) => (
        currentUserProjects.find(project => project.id === activeProject) || emptyObject
    ),
);
