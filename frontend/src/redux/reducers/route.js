import createReducerWithMap from '../../utils/createReducerWithMap';
import initialRouteState from '../initial-state/route';
import { isTruthy } from '../../vendor/react-store/utils/common';

// TYPE

export const ROUTE__SET_PARAMS = 'route/SET_PARAMS';
export const ROUTE__CLEAR_STATE = 'route/CLEAR_STATE';

// ACTION-CREATOR

export const setRouteParamsAction = ({ match, location }) => ({
    type: ROUTE__SET_PARAMS,
    match,
    location,
    // params,
});

export const clearRouteStateAction = () => ({
    type: ROUTE__CLEAR_STATE,
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
    const { path, url, isExact, params } = action.match;
    const { state: routeState } = action.location;

    const newState = {
        path,
        url,
        isExact,
        params: transform(params),
        routeState,
    };
    return newState;
};

const clearRouteState = (state) => {
    const newState = {
        ...state,
        routeState: {},
    };
    return newState;
};

export const routeReducers = {
    [ROUTE__SET_PARAMS]: setRouteParams,
    [ROUTE__CLEAR_STATE]: clearRouteState,
};

const routeReducer = createReducerWithMap(routeReducers, initialRouteState);
export default routeReducer;
