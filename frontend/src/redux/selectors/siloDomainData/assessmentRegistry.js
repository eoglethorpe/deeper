import { createSelector } from 'reselect';
import { aryIdFromRoute } from '../domainData';

const emptyObject = {};

const aryViewSelector = ({ siloDomainData }) => (
    siloDomainData.aryView || emptyObject
);

const aryViewFromRouteSelector = createSelector(
    aryViewSelector,
    aryIdFromRoute,
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
