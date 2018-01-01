import { createSelector } from 'reselect';
import {
    analysisFrameworksSelector,
    countriesListSelector,
    currentUserProjectsSelector,
    leadFilterOptionsSelector,
    projectsSelector,
    projectsOptionsSelector,
    analysisFrameworkIdFromProps,
} from './domainData';


// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

export const leadIdFromRoute = (state, { match }) => match.params.leadId;
export const projectIdFromRoute = (state, { match }) => match.params.projectId;
export const categoryEditorIdFromRoute = (state, { match }) => match.params.categoryEditorId;

// LEAD ADD

export const addLeadViewFiltersSelector = ({ siloDomainData }) => (
    siloDomainData.addLeadView.filters || emptyObject
);
export const addLeadViewActiveLeadIdSelector = ({ siloDomainData }) => (
    siloDomainData.addLeadView.activeLeadId
);

export const addLeadViewLeadsSelector = ({ siloDomainData }) => (
    siloDomainData.addLeadView.leads || emptyList
);
export const addLeadViewActiveLeadSelector = createSelector(
    addLeadViewActiveLeadIdSelector,
    addLeadViewLeadsSelector,
    (leadId, leads) => leads.find(lead => lead.data.id === leadId),
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

// COMMON

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

export const projectOptionsSelector = createSelector(
    projectsOptionsSelector,
    activeProjectSelector,
    (projectsOptions, activeProject) => projectsOptions[activeProject] || emptyObject,
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

// LEADS

export const leadPageSelector = ({ siloDomainData }) => siloDomainData.leadPage;

export const leadPageForProjectSelector = createSelector(
    leadPageSelector,
    activeProjectSelector,
    (leadPage, activeProject) => (
        leadPage[activeProject] || emptyObject
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

export const leadPageViewModeSelector = createSelector(
    leadPageForProjectSelector,
    leadPage => leadPage.viewMode || 'table',
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

// ENTRIES

export const entriesViewSelector = ({ siloDomainData }) => siloDomainData.entriesView;

export const entriesViewForProjectSelector = createSelector(
    entriesViewSelector,
    projectIdFromRoute,
    (entriesView, activeProject) => (
        entriesView[activeProject] || emptyObject
    ),
);

export const entriesViewFilterSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.filter || emptyObject,
);

export const entriesForProjectSelector = createSelector(
    entriesViewForProjectSelector,
    entriesView => entriesView.entries || emptyList,
);

export const analysisFrameworkForProjectSelector = createSelector(
    projectIdFromRoute,
    projectsSelector,
    analysisFrameworksSelector,
    (projectId, projects, analysisFrameworks) => (
        (projects[projectId].analysisFramework
            && analysisFrameworks[projects[projectId].analysisFramework]) || emptyObject
    ),
);


// EDIT_ENTRY
export const editEntryViewSelector = ({ siloDomainData }) => (
    siloDomainData.editEntryView || emptyObject
);

export const editEntryViewForLeadIdSelector = createSelector(
    leadIdFromRoute,
    editEntryViewSelector,
    (leadId, editEntryView) => editEntryView[leadId] || emptyObject,
);

export const editEntryViewCurrentLeadSelector = createSelector(
    editEntryViewForLeadIdSelector,
    editEntryView => editEntryView.lead || emptyObject,
);

export const editEntryViewSelectedEntryIdSelector = createSelector(
    editEntryViewForLeadIdSelector,
    editEntryView => editEntryView.selectedEntryId,
);

export const editEntryViewEntriesSelector = createSelector(
    editEntryViewForLeadIdSelector,
    editEntryView => editEntryView.entries || emptyList,
);

export const editEntryViewCurrentProjectSelector = createSelector(
    editEntryViewCurrentLeadSelector,
    projectsSelector,
    (lead, projects) => (lead.project && projects[lead.project]) || emptyObject,
);

export const editEntryViewCurrentAnalysisFrameworkSelector = createSelector(
    editEntryViewCurrentProjectSelector,
    analysisFrameworksSelector,
    (project, analysisFrameworks) => (
        (project.analysisFramework && analysisFrameworks[project.analysisFramework]) || emptyObject
    ),
);

// ANALYSIS_FRAMEWORK

export const afViewAnalysisFrameworkSelector = ({ siloDomainData }) => (
    siloDomainData.analysisFrameworkView.analysisFramework
);

export const afViewCurrentAnalysisFrameworkSelector = createSelector(
    analysisFrameworkIdFromProps,
    afViewAnalysisFrameworkSelector,
    (id, analysisFramework) => (
        (analysisFramework && analysisFramework.id === +id) ? analysisFramework : undefined
    ),
);

// CATEGORY EDITOR

export const categoryEditorsViewSelector = ({ siloDomainData }) => (
    siloDomainData.categoryEditorView || emptyObject
);

export const categoryEditorViewPristineSelector = createSelector(
    categoryEditorsViewSelector,
    categoryEditorIdFromRoute,
    (view, id) => (view[id] || emptyObject).pristine,
);

export const categoryEditorViewTitleSelector = createSelector(
    categoryEditorsViewSelector,
    categoryEditorIdFromRoute,
    (view, id) => (view[id] || emptyObject).title || '',
);

export const categoryEditorViewVersionIdSelector = createSelector(
    categoryEditorsViewSelector,
    categoryEditorIdFromRoute,
    (view, id) => (view[id] || emptyObject).versionId,
);

export const categoryEditorViewSelector = createSelector(
    categoryEditorsViewSelector,
    categoryEditorIdFromRoute,
    (view, id) => (view[id] || emptyObject).data || emptyObject,
);

export const categoriesSelector = createSelector(
    categoryEditorViewSelector,
    view => view.categories || emptyList,
);

export const activeCategoryIdSelector = createSelector(
    categoryEditorViewSelector,
    view => view.activeCategoryId,
);

export const selectedSubcategorySelector = createSelector(
    categoriesSelector,
    activeCategoryIdSelector,
    (categories, activeCategoryId) => {
        if (!activeCategoryId) {
            return undefined;
        }

        const category = categories.find(d => d.id === activeCategoryId);
        const selectedSubcategories = category.selectedSubcategories;

        if (selectedSubcategories.length === 0) {
            return undefined;
        }

        let subcategory = {};
        let subcategories = category.subcategories;

        selectedSubcategories.forEach((selected) => {
            subcategory = subcategories.find(d => d.id === selected);
            subcategories = subcategory.subcategories;
        });

        return subcategory;
    },
);

// Gallery Files
export const userGalleryFilesSelector = ({ siloDomainData }) => (
    siloDomainData.userGalleryFiles || emptyList
);
