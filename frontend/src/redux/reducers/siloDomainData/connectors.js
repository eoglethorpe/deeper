import update from '../../../vendor/react-store/utils/immutable-update';

export const SET_USER_CONNECTORS = 'siloDomainData/SET_USER_CONNECTORS';
export const SET_USER_CONNECTOR_DETAILS = 'siloDomainData/SET_USER_CONNECTOR_DETAILS';
export const ADD_USER_CONNECTOR = 'siloDomainData/ADD_USER_CONNECTOR';
// REDUCER

export const setUserConnectorsAction = ({ connectors }) => ({
    type: SET_USER_CONNECTORS,
    connectors,
});

export const setUserConnectorDetailsAction = ({ connector }) => ({
    type: SET_USER_CONNECTOR_DETAILS,
    connector,
});

export const addUserConnectorAction = ({ connector }) => ({
    type: ADD_USER_CONNECTOR,
    connector,
});

export const setUserConnectors = (state, action) => {
    const { connectors } = action;
    const settings = {
        connectors: { $set: connectors },
    };
    return update(state, settings);
};

export const setUserConnectorDetails = (state, action) => {
    const { connector } = action;
    const settings = {
        connectors: { $auto: {
            [connector.id]: { $set: connector },
        } },
    };
    return update(state, settings);
};

export const addUserConnector = (state, action) => {
    const { connector } = action;
    const settings = {
        connectors: {
            [connector.id]: { $set: connector },
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_USER_CONNECTORS]: setUserConnectors,
    [SET_USER_CONNECTOR_DETAILS]: setUserConnectorDetails,
    [ADD_USER_CONNECTOR]: addUserConnector,
};

export default reducers;

