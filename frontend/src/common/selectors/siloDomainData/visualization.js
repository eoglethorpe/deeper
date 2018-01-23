import { createSelector } from 'reselect';

const emptyObject = {};
const emptyGeoPointsData = { points: [] };

// Gallery Files

export const visualizationSelector = ({ siloDomainData }) => (
    siloDomainData.visualization || emptyObject
);

/*
export const visualizationStaleSelector = createSelector(
    visualizationSelector,
    viz => viz.stale,
);
*/

export const hierarchialDataSelector = createSelector(
    visualizationSelector,
    viz => viz.hierarchialData || emptyObject,
);

export const chordDataSelector = createSelector(
    visualizationSelector,
    viz => viz.chordData || emptyObject,
);

export const correlationDataSelector = createSelector(
    visualizationSelector,
    viz => viz.correlationData || emptyObject,
);

export const barDataSelector = createSelector(
    visualizationSelector,
    viz => viz.barData || emptyObject,
);

export const forceDirectedDataSelector = createSelector(
    visualizationSelector,
    viz => viz.forceDirectedData || emptyObject,
);

export const geoPointsDataSelector = createSelector(
    visualizationSelector,
    viz => viz.geoPointsData || emptyGeoPointsData,
);
