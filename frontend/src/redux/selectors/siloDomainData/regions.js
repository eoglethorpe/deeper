import { createSelector } from 'reselect';
import { countryIdFromRoute } from '../domainData';

const emptyObject = {};

const regionsViewSelector = ({ siloDomainData }) => (
    siloDomainData.regions
);

export const regionDetailSelector = createSelector(
    countryIdFromRoute,
    regionsViewSelector,
    (id, regions) => (
        regions[id] || emptyObject
    ),
);

export const generalDetailsForRegionSelector = createSelector(
    regionDetailSelector,
    region => region.faramValues || emptyObject,
);
