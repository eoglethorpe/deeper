import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE
export const SET_CONNECTOR_SOURCES = 'domainData/SET_CONNECTOR_SOURCES';

export const setConnectorSourcesAction = ({ connectorSources }) => ({
    type: SET_CONNECTOR_SOURCES,
    connectorSources,
});

const setConnectorSources = (state, action) => {
    const { connectorSources } = action;

    const settings = {
        connectorSources: {
            $set: connectorSources,
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_CONNECTOR_SOURCES]: setConnectorSources,
};

export default reducers;
