import { createSelector } from 'reselect';
import { connectorIdFromRoute, connectorSourcesSelector } from '../domainData';
import { compareString } from '../../../vendor/react-store/utils/common';

const emptyObject = {};

export const connectorsViewSelector = ({ siloDomainData }) => (
    siloDomainData.connectorsView || emptyObject
);

const connectorsSelector = createSelector(
    connectorsViewSelector,
    c => c.list || emptyObject,
);

const connectorsDetailsSelector = createSelector(
    connectorsViewSelector,
    c => c.details || emptyObject,
);

const connectorDetailsFromListSelector = createSelector(
    connectorIdFromRoute,
    connectorsSelector,
    (id, connectors) => (
        connectors[id] || emptyObject
    ),
);

export const connectorsListSelector = createSelector(
    connectorsSelector,
    c => Object.values(c).sort((a, b) => compareString(a.title, b.title)),
);

export const connectorDetailsSelector = createSelector(
    connectorIdFromRoute,
    connectorsDetailsSelector,
    (id, connectors) => (
        connectors[id] || emptyObject
    ),
);

export const connectorSourceSelector = createSelector(
    connectorSourcesSelector,
    connectorDetailsFromListSelector,
    (sources, connector) => sources[connector.source],
);
