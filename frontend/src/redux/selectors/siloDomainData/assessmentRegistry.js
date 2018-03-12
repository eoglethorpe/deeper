import { createSelector } from 'reselect';
import { leadIdFromRoute, projectIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyList = [];
const zeroNumber = 0;
const oneNumber = 1;

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
    aryPage => aryPage.totalArysCount || zeroNumber,
);

export const aryPageActivePageSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.activePage || oneNumber,
);

export const aryPageActiveSortSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.activeSort || '-created_at',
);

export const aryPageFilterSelector = createSelector(
    aryPageForProjectSelector,
    aryPage => aryPage.filter || emptyObject,
);
// ARY VIEW SELECTORS

const aryViewSelector = ({ siloDomainData }) => (
    siloDomainData.aryView || emptyObject
);

const aryViewFromRouteSelector = createSelector(
    aryViewSelector,
    leadIdFromRoute,
    (view, id) => view[id] || emptyObject,
);

export const aryViewMetadataSelector = createSelector(
    aryViewFromRouteSelector,
    view => view.metaData || emptyObject,
);

export const aryViewMethodologySelector = createSelector(
    aryViewFromRouteSelector,
    view => view.methodology || emptyObject,
);
