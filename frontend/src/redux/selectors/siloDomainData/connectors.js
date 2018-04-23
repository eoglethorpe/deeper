import { createSelector } from 'reselect';
import { connectorIdFromRoute } from '../domainData';

const emptyObject = {};

export const connectorsSelector = ({ siloDomainData }) => (
    siloDomainData.connectors || emptyObject
);

export const connectorsListSelector = createSelector(
    connectorsSelector,
    c => Object.values(c),
);

export const connectorSelector = createSelector(
    connectorIdFromRoute,
    connectorsSelector,
    (id, connectors) => (
        connectors[id] || emptyObject
    ),
);

