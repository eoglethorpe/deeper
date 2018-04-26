import {
    analyzeErrors,
} from '../../../vendor/react-store/components/Input/Faram/validator';
import update from '../../../vendor/react-store/utils/immutable-update';

export const SET_USER_CONNECTORS = 'siloDomainData/SET_USER_CONNECTORS';
export const SET_USER_CONNECTOR_DETAILS = 'siloDomainData/SET_USER_CONNECTOR_DETAILS';
export const CHANGE_USER_CONNECTOR_DETAILS = 'siloDomainData/CHANGE_USER_CONNECTOR_DETAILS';
export const SET_ERROR_USER_CONNECTOR_DETAILS = 'siloDomainData/SET_ERROR_USER_CONNECTOR_DETAILS';
export const ADD_USER_CONNECTOR = 'siloDomainData/ADD_USER_CONNECTOR';
// REDUCER

export const setUserConnectorsAction = ({ connectors }) => ({
    type: SET_USER_CONNECTORS,
    connectors,
});

export const setUserConnectorDetailsAction = ({ connectorDetails, connectorId }) => ({
    type: SET_USER_CONNECTOR_DETAILS,
    connectorDetails,
    connectorId,
});

export const changeUserConnectorDetailsAction = ({ faramValues, faramErrors, connectorId }) => ({
    type: CHANGE_USER_CONNECTOR_DETAILS,
    faramValues,
    faramErrors,
    connectorId,
});

export const setErrorUserConnectorDetailsAction = ({ faramErrors, connectorId }) => ({
    type: SET_ERROR_USER_CONNECTOR_DETAILS,
    faramErrors,
    connectorId,
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
    const {
        connectorDetails,
        connectorId,
    } = action;

    const settings = {
        connectors: { $auto: {
            [connectorId]: { $merge: connectorDetails },
        } },
    };
    return update(state, settings);
};

export const changeUserConnectorDetails = (state, action) => {
    const {
        faramValues,
        faramErrors,
        connectorId,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);

    const settings = {
        connectors: { $auto: {
            [connectorId]: {
                faramValues: { $set: faramValues },
                faramErrors: { $set: faramErrors },
                hasErrors: { $set: hasErrors },
                pristine: { $set: true },
            },
        } },
    };
    return update(state, settings);
};

export const setErrorUserConnectorDetails = (state, action) => {
    const {
        faramErrors,
        connectorId,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);

    const settings = {
        connectors: { $auto: {
            [connectorId]: {
                faramErrors: { $set: faramErrors },
                hasErrors: { $set: hasErrors },
            },
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
    [CHANGE_USER_CONNECTOR_DETAILS]: changeUserConnectorDetails,
    [SET_ERROR_USER_CONNECTOR_DETAILS]: setErrorUserConnectorDetails,
    [ADD_USER_CONNECTOR]: addUserConnector,
};

export default reducers;

