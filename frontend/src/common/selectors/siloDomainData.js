import { createSelector } from 'reselect';
import {
    analysisFrameworksSelector,
    countriesListSelector,
    currentUserProjectsSelector,
    leadFilterOptionsSelector,
    leadIdFromProps,
    projectsSelector,
} from './domainData';


// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

export const addLeadViewFiltersSelector = ({ siloDomainData }) => (
    siloDomainData.addLeadView.filters || emptyObject
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

export const addLeadViewCanNextSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewActiveLeadIdSelector,
    (leads, activeLeadId) => {
        const index = leads.findIndex(
            lead => lead.data.id === activeLeadId,
        );
        return index + 1 < leads.length;
    },
);

export const addLeadViewCanPrevSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewActiveLeadIdSelector,
    (leads, activeLeadId) => {
        const index = leads.findIndex(
            lead => lead.data.id === activeLeadId,
        );
        return index - 1 >= 0;
    },
);

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

export const leadsForProjectSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.leads || emptyList,
);

export const totalLeadsCountForProjectSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.totalLeadsCount || 0,
);

export const editEntryViewLeadSelector = ({ siloDomainData }) => (
    siloDomainData.editEntryView.lead
);

export const editEntryViewCurrentLeadSelector = createSelector(
    editEntryViewLeadSelector,
    leadIdFromProps,
    (lead, leadId) => (
        (lead.id === +leadId) ? lead : undefined
    ),
);

export const editEntryViewCurrentProjectSelector = createSelector(
    editEntryViewCurrentLeadSelector,
    projectsSelector,
    (lead, projects) => lead && projects[lead.project],
);

export const editEntryViewCurrentAnalysisFrameworkSelector = createSelector(
    editEntryViewCurrentProjectSelector,
    analysisFrameworksSelector,
    (project, analysisFrameworks) => (
        project && analysisFrameworks[project.analysisFramework]
    ),
);
