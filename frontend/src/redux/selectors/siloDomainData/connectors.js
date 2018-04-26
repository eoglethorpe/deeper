import { createSelector } from 'reselect';
import { connectorIdFromRoute, connectorSourcesSelector } from '../domainData';
import { compareString } from '../../../vendor/react-store/utils/common';

const emptyObject = {};

export const connectorsSelector = ({ siloDomainData }) => (
    siloDomainData.connectors || emptyObject
);

export const connectorsListSelector = createSelector(
    connectorsSelector,
    c => Object.values(c).sort(
        ({ aFaramValues = {} }, { bFaramValues = {} }) => compareString(
            aFaramValues.title,
            bFaramValues.title,
        ),
    ),
);

export const connectorDetailsSelector = createSelector(
    connectorIdFromRoute,
    connectorsSelector,
    (id, connectors) => (
        connectors[id] || emptyObject
    ),
);

export const connectorSourceSelector = createSelector(
    connectorSourcesSelector,
    connectorDetailsSelector,
    (sources, connector) => sources[connector.source],
);
