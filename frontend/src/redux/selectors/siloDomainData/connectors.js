import { createSelector } from 'reselect';
import { connectorIdFromRoute } from '../domainData';
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

export const connectorSelector = createSelector(
    connectorIdFromRoute,
    connectorsSelector,
    (id, connectors) => (
        connectors[id] || emptyObject
    ),
);

