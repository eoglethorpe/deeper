import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyList = [];

// ARYS SELECTORS
const aryPageSelector = ({ siloDomainData }) => siloDomainData.aryPage;

const aryPageForProjectSelector = createSelector(
    aryPageSelector,
    projectIdFromRoute,
    (aryPage, activeProject) => (
        aryPage[activeProject] || emptyObject
    ),
);

export const arysForProjectSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.arys || emptyList,
);

export const totalArysCountForProjectSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.totalArysCount || 0,
);

export const aryPageActivePageSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.activePage || 1,
);

export const aryPageActiveSortSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.activeSort || '-created_at',
);

export const aryPageFilterSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.filter || emptyObject,
);
