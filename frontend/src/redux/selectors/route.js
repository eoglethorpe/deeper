import { createSelector } from 'reselect';

const emptyObject = {};

export const routeUrlSelector = ({ route }) => (
    route.url
);

export const routeParamsSelector = ({ route }) => (
    route.params || emptyObject
);

export const routeStateSelector = ({ route }) => (
    route.routeState || emptyObject
);

export const afIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.analysisFrameworkId,
);

export const ceIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.categoryEditorId,
);

export const aryIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.aryId,
);

export const countryIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.countryId,
);
export const groupIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.userGroupId,
);
export const leadIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.leadId,
);
export const projectIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.projectId,
);
export const userIdFromRouteSelector = createSelector(
    routeParamsSelector,
    routeParams => routeParams.userId,
);
