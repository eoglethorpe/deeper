import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE
export const SET_CONNECTOR_SOURCES = 'domainData/SET_CONNECTOR_SOURCES';

export const setConnectorSourcesAction = ({ connectorSources }) => ({
    type: SET_CONNECTOR_SOURCES,
    connectorSources,
});

const setConnectorSources = (state, action) => {
    const { connectorSources } = action;
    const connectorSourcesObject = {};
    connectorSources.forEach((c) => {
        connectorSourcesObject[c.key] = c;
    });

    const settings = {
        connectorSources: {
            $set: connectorSourcesObject,
        },
    };
    return update(state, settings);
};

const reducers = {
    [SET_CONNECTOR_SOURCES]: setConnectorSources,
};

export default reducers;
