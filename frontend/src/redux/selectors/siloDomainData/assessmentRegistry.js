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

// eslint-disable-next-line import/prefer-default-export
export const aryViewMetadataSelector = createSelector(
    aryViewFromRouteSelector,
    view => view.metaData || emptyObject,
);
