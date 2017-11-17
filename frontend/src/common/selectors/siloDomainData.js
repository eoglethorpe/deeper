import { createSelector } from 'reselect';
import {
    countriesListSelector,
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

export const addLeadViewFiltersSelector = ({ siloDomainData }) => (
    siloDomainData.addLeadView.filters || emptyObject
);
export const addLeadViewLeadsCountSelector = ({ siloDomainData }) => (
    (siloDomainData.addLeadView.leads || emptyList).length
);
export const addLeadViewActiveLeadIdSelector = ({ siloDomainData }) => (
    siloDomainData.addLeadView.activeLeadId
);

export const addLeadViewLeadsSelector = ({ siloDomainData }) => (
    siloDomainData.addLeadView.leads || emptyList
);
export const addLeadViewLeadsFilteredSelector = createSelector(
    addLeadViewLeadsSelector,
    leads => leads.filter(lead => lead.isFiltrate),
);

/*
export const addLeadViewActiveLeadSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewActiveLeadIdSelector,
    (leads, leadId) => leads.find(lead => lead.data.id === leadId),
);
*/

export const activeProjectSelector = ({ siloDomainData }) => (
    siloDomainData.activeProject
);

export const activeCountrySelector = ({ siloDomainData }) => (
    siloDomainData.activeCountry
);

// FIXME: rename to countryDetailForCountrySelector
export const countryDetailSelector = createSelector(
    countriesListSelector,
    activeCountrySelector,
    (regions, activeCountry) => (
        regions.find(country => country.id === activeCountry) || emptyObject
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


export const leadPageSelector = ({ siloDomainData }) => siloDomainData.leadPage;

export const leadPageForProjectSelector = createSelector(
    leadPageSelector,
    activeProjectSelector,
    (leadPage, activeProject) => (
        leadPage[activeProject] || {}
    ),
);

export const leadPageFilterSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.filter || emptyObject,
);

export const leadPageActivePageSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.activePage || 1,
);

export const leadPageActiveSortSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.activeSort || '-created_at',
);
