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

export const editAryFormErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.formErrors || emptyObject,
);

export const editAryFieldErrorsSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.fieldErrors || emptyObject,
);

export const editAryFormValuesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.formValues || emptyObject,
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

export const editArySelectedSectorsSelector = createSelector(
    editAryFormValuesSelector,
    (formValues) => {
        const methodology = formValues.methodology || emptyObject;
        return methodology.sectors || emptyList;
    },
);

export const editAryEntriesSelector = createSelector(
    editAryFromRouteSelector,
    ary => ary.entries || emptyList,
);
