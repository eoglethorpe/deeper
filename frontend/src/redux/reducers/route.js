import createReducerWithMap from '../../utils/createReducerWithMap';
import initialRouteState from '../initial-state/route';
import { isTruthy } from '../../vendor/react-store/utils/common';

// TYPE

export const ROUTE__SET_PARAMS = 'route/SET_PARAMS';

// ACTION-CREATOR

export const setRouteParamsAction = params => ({
    type: ROUTE__SET_PARAMS,
    params,
});

// REDUCER

const urlValues = [
    'projectId',
    'leadId',
    'analysisFrameworkId',
    'categoryEditorId',
    'aryId',
    'countryId',
    'userGroupId',
    'userId',
];

const transform = (params) => {
    const newParams = { ...params };
    urlValues.forEach((urlValue) => {
        if (isTruthy(newParams[urlValue])) {
            newParams[urlValue] = +newParams[urlValue];
        }
    });
    return newParams;
};

const setRouteParams = (state, action) => {
    const { path, url, isExact, params } = action.params;
    const newState = {
        path,
        url,
        isExact,
        params: transform(params),
    };
    return newState;
};

export const routeReducers = {
    [ROUTE__SET_PARAMS]: setRouteParams,
};

const routeReducer = createReducerWithMap(routeReducers, initialRouteState);
export default routeReducer;
