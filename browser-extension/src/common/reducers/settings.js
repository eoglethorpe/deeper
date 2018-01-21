import update from '../../public/utils/immutable-update';
import createReducerWithMap from '../utils/createReducerWithMap';
import initialSettingsState from '../initial-state/settings';

// TYPE

export const SET_SERVER_ADDRESS_ACTION = 'auth/SET_SERVER_ADDRESS';

// ACTION-CREATOR

export const setServerAddressAction = ({ serverAddress, apiAddress }) => ({
    type: SET_SERVER_ADDRESS_ACTION,
    serverAddress,
    apiAddress,
});

// REDUCER

const setServerAddress = (state, action) => {
    const {
        serverAddress,
        apiAddress,
    } = action;

    const settings = {
        serverAddress: { $set: serverAddress },
        apiAddress: { $set: apiAddress },
    };

    const newState = update(state, settings);
    return newState;
};

export const settingsReducers = {
    [SET_SERVER_ADDRESS_ACTION]: setServerAddress,
};

const settingsReducer = createReducerWithMap(settingsReducers, initialSettingsState);
export default settingsReducer;

