// import jwtDecode from 'jwt-decode';
import update from '../../vendor/react-store/utils/immutable-update';
import createReducerWithMap from '../utils/createReducerWithMap';
// import schema from '../../common/schema';
import initialDomainDataState from '../initial-state/domainData';

// TYPE

// export const LOGIN_ACTION = 'auth/LOGIN';
export const UPDATE_INPUT_VALUE_ACTION = 'extension/UPDATE_INPUT_VALUE';
export const UPDATE_INPUT_VALUES_ACTION = 'extension/UPDATE_INPUT_VALUES';
export const CLEAR_INPUT_VALUE_ACTION = 'extension/CLEAR_INPUT_VALUES';

// ACTION-CREATOR

export const updateInputValueAction = ({ tabId, id, value }) => ({
    type: UPDATE_INPUT_VALUE_ACTION,
    tabId,
    id,
    value,
});

export const updateInputValuesAction = ({ tabId, values, uiState }) => ({
    type: UPDATE_INPUT_VALUES_ACTION,
    tabId,
    values,
    uiState,
});

export const clearInputValueAction = ({ tabId }) => ({
    type: CLEAR_INPUT_VALUE_ACTION,
    tabId,
});

// REDUCER
const clearInputValue = (state, action) => {
    const { tabId } = action;

    const settings = {
        [tabId]: { $set: undefined },
    };

    const newState = update(state, settings);
    return newState;
};

const updateInputValue = (state, action) => {
    const {
        tabId,
        id,
        value,
    } = action;

    const settings = {
        [tabId]: { $auto: {
            inputValues: { $auto: {
                $merge: {
                    [id]: value,
                },
            } },
        } },
    };

    const newState = update(state, settings);
    return newState;
};

const updateInputValues = (state, action) => {
    const {
        tabId,
        uiState,
        values,
    } = action;

    const settings = {
        [tabId]: { $auto: {
            inputValues: { $auto: {
                $merge: values,
            } },
            uiState: { $auto: {
                $set: uiState,
            } },
        } },
    };

    const newState = update(state, settings);
    return newState;
};

export const domainDataReducers = {
    [UPDATE_INPUT_VALUE_ACTION]: updateInputValue,
    [UPDATE_INPUT_VALUES_ACTION]: updateInputValues,
    [CLEAR_INPUT_VALUE_ACTION]: clearInputValue,
    // [LOGIN_ACTION]: login,
};

const domainDataReducer = createReducerWithMap(domainDataReducers, initialDomainDataState);
export default domainDataReducer;
