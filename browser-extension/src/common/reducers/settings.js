import update from '../../public/utils/immutable-update';
import createReducerWithMap from '../utils/createReducerWithMap';
import initialSettingsState from '../initial-state/settings';

// TYPE

export const SET_SERVER_ADDRESS_ACTION = 'auth/SET_SERVER_ADDRESS';

// ACTION-CREATOR

export const setServerAddressAction = ({ serverAddress }) => ({
    type: SET_SERVER_ADDRESS_ACTION,
    serverAddress,
});

// REDUCER

const setServerAddress = (state, action) => {
    const {
        serverAddress,
    } = action;

    const settings = {
        serverAddress: {
            $set: serverAddress,
        },
    };

    const newState = update(state, settings);
    return newState;
};

export const settingsReducers = {
    [SET_SERVER_ADDRESS_ACTION]: setServerAddress,
};

const settingsReducer = createReducerWithMap(settingsReducers, initialSettingsState);
export default settingsReducer;

