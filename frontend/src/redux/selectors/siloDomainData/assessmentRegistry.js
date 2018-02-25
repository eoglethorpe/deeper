import { createSelector } from 'reselect';
import { aryIdFromRoute } from '../domainData';

const emptyObject = {};

const assessmentRegistryViewSelector = ({ siloDomainData }) => (
    siloDomainData.assessmentRegistryView || emptyObject
);

const aryViewFromRouteSelector = createSelector(
    assessmentRegistryViewSelector,
    aryIdFromRoute,
    (view, id) => view[id] || emptyObject,
);

// eslint-disable-next-line import/prefer-default-export
export const aryViewMetadataSelector = createSelector(
    aryViewFromRouteSelector,
    view => view.metadata || emptyObject,
);
