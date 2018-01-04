import createReducerWithMap from '../utils/createReducerWithMap';
import initialRouteState from '../initial-state/route';

// TYPE

export const ROUTE__SET_PARAMS = 'route/SET_PARAMS';

// ACTION-CREATOR

export const setRouteParamsAction = params => ({
    type: ROUTE__SET_PARAMS,
    params,
});

// REDUCER

const setRouteParams = (state, action) => {
    const newState = {
        ...state,
        params: action.params,
    };
    return newState;
};

export const routeReducers = {
    [ROUTE__SET_PARAMS]: setRouteParams,
};

const routeReducer = createReducerWithMap(routeReducers, initialRouteState);
export default routeReducer;
