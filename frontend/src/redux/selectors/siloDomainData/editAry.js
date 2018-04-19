import { createSelector } from 'reselect';
import { leadIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyList = [];

// ARY VIEW SELECTORS

const editArySelector = ({ siloDomainData }) => (
    siloDomainData.editAry || emptyObject
);

const editAryFromRouteSelector = createSelector(
    editArySelector,
    leadIdFromRoute,
    (view, id) => view[id] || emptyObject,
);

export const editAryServerIdSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.serverId,
);

export const editAryVersionIdSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.versionId,
);

export const editAryHasErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => !!ary.hasErrors,
);

export const editAryIsPristineSelector = createSelector(
    editAryFromRouteSelector,
    ary => !!ary.isPristine,
);

export const editAryFaramErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.faramErrors || emptyObject,
);

export const editAryFaramValuesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.faramValues || emptyObject,
);

export const editAryEntriesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.entries || emptyList,
);

export const editAryLeadSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.lead || emptyObject,
);

export const editArySelectedSectorsSelector = createSelector(
    editAryFaramValuesSelector,
    (faramValues) => {
        const methodology = faramValues.methodology || emptyObject;
        return methodology.sectors || emptyList;
    },
);
