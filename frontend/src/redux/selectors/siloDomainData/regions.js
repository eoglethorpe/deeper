import { createSelector } from 'reselect';
import { countryIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyList = [];

const regionsViewSelector = ({ siloDomainData }) => (
    siloDomainData.regionsView
);

export const regionsViewRegionsSelector = createSelector(
    regionsViewSelector,
    regionsView => regionsView.regions,
);

export const regionDetailSelector = createSelector(
    countryIdFromRoute,
    regionsViewRegionsSelector,
    (id, regions) => (
        regions[id] || emptyObject
    ),
);
