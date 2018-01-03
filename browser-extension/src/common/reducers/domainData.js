// import jwtDecode from 'jwt-decode';
import update from '../../public/utils/immutable-update';
import createReducerWithMap from '../utils/createReducerWithMap';
// import schema from '../../common/schema';
import initialDomainDataState from '../initial-state/domainData';

// TYPE

// export const LOGIN_ACTION = 'auth/LOGIN';
export const UPDATE_INPUT_VALUE_ACTION = 'extension/UPDATE_INPUT_VALUES';

// ACTION-CREATOR

export const updateInputValueAction = ({ tabId, id, value }) => ({
    type: UPDATE_INPUT_VALUE_ACTION,
    tabId,
    id,
    value,
});

/*
export const loginAction = ({ access, refresh }) => ({
    type: LOGIN_ACTION,
    access,
    refresh,
});
*/

// REDUCER

/*
const login = (state, action) => {
    const { access, refresh } = action;
    const decodedToken = decodeAccessToken(access);
    const settings = {
        token: { $set: {
            access,
            refresh,
        } },
        activeUser: { $set: decodedToken },
    };
    return update(state, settings);
};
*/

/*
const defaultInputValues = {
    project: [],
    title: undefined,
    source: undefined,
    confidentiality: undefined,
    assignedTo: [],
    publishedOn: undefined,
    url: undefined,
    website: undefined,
};
*/

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


export const domainDataReducers = {
    [UPDATE_INPUT_VALUE_ACTION]: updateInputValue,
    // [LOGIN_ACTION]: login,
};

const domainDataReducer = createReducerWithMap(domainDataReducers, initialDomainDataState);
export default domainDataReducer;
