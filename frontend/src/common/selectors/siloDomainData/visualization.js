import { createSelector } from 'reselect';
import { activeProjectSelector } from '../siloDomainData';

const emptyObject = {};
const emptyhierarchialData = {
    name: 'TOPICS',
    children: [{ name: 'TOPIC 1', children: [] }],
};
const emptyCorrelationData = { labels: [], values: [[]] };
const emptyForceDirectedData = { nodes: [], links: [] };
const emptyGeoPointsData = { points: [] };

// Gallery Files

export const visualizationsSelector = ({ siloDomainData }) => (
    siloDomainData.visualization || emptyObject
);

export const visualizationSelector = createSelector(
    visualizationsSelector,
    activeProjectSelector,
    (viz, projectId) => viz[projectId] || emptyObject,
);

/*
export const visualizationStaleSelector = createSelector(
    visualizationSelector,
    viz => viz.stale,
);
*/

export const hierarchialDataSelector = createSelector(
    visualizationSelector,
    viz => viz.hierarchialData || emptyhierarchialData,
);

export const chordDataSelector = createSelector(
    visualizationSelector,
    viz => viz.chordData || emptyCorrelationData,
);

export const correlationDataSelector = createSelector(
    visualizationSelector,
    viz => viz.correlationData || emptyCorrelationData,
);

export const barDataSelector = createSelector(
    visualizationSelector,
    viz => viz.barData || emptyObject,
);

export const forceDirectedDataSelector = createSelector(
    visualizationSelector,
    viz => viz.forceDirectedData || emptyForceDirectedData,
);

export const geoPointsDataSelector = createSelector(
    visualizationSelector,
    viz => viz.geoPointsData || emptyGeoPointsData,
);
