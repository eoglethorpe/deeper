import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyList = [];
const emptyObject = {};

const leadPageSelector = ({ siloDomainData }) => siloDomainData.leadPage;

const leadPageForProjectSelector = createSelector(
    leadPageSelector,
    projectIdFromRoute,
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
