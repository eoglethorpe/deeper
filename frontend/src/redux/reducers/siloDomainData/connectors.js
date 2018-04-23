import update from '../../../vendor/react-store/utils/immutable-update';

export const SET_USER_CONNECTORS = 'siloDomainData/SET_USER_CONNECTORS';
// REDUCER

export const setUserConnectorsAction = ({ connectors }) => ({
    type: SET_USER_CONNECTORS,
    connectors,
});

export const setUserConnectors = (state, action) => {
    const { connectors } = action;
    const settings = {
        connectors: { $set: connectors },
    };
    return update(state, settings);
};

const reducers = {
    [SET_USER_CONNECTORS]: setUserConnectors,
};

export default reducers;

