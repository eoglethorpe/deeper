import { createSelector } from 'reselect';
import {
    isObjectEmpty,
    compareString,
} from '../../../vendor/react-store/utils/common';
import {
    projectIdFromRoute,
    connectorIdFromRoute,
} from '../domainData';
import { leadAccessor } from '../../../entities/lead';

const emptyList = [];
const emptyObject = {};

const addLeadViewSelector = ({ siloDomainData }) => siloDomainData.addLeadView;

export const addLeadViewFiltersSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.filters || emptyObject,
);

export const addLeadViewIsFilterEmptySelector = createSelector(
    addLeadViewFiltersSelector,
    filters => isObjectEmpty(filters),
);

export const addLeadViewActiveLeadIdSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.activeLeadId,
);

export const addLeadViewLeadRestsSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.leadRests || emptyObject,
);
export const addLeadViewLeadUploadsSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.leadUploads || emptyObject,
);
export const addLeadViewLeadDriveRestsSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.leadDriveRests || emptyObject,
);
export const addLeadViewLeadDropboxRestsSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.leadDropboxRests || emptyObject,
);

export const addLeadViewLeadsSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.leads || emptyList,
);

export const addLeadViewActiveLeadSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewActiveLeadIdSelector,
    (leads, activeLeadId) => leads.find(
        lead => leadAccessor.getKey(lead) === activeLeadId,
    ),
);

export const addLeadViewCanNextSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewActiveLeadIdSelector,
    (leads, activeLeadId) => {
        const index = leads.findIndex(
            lead => leadAccessor.getKey(lead) === activeLeadId,
        );
        return index + 1 < leads.length;
    },
);

export const addLeadViewCanPrevSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewActiveLeadIdSelector,
    (leads, activeLeadId) => {
        const index = leads.findIndex(
            lead => leadAccessor.getKey(lead) === activeLeadId,
        );
        return index - 1 >= 0;
    },
);

const addLeadViewConnectorsSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.connectorsList || emptyObject,
);

const addLeadViewConnectorsForProjectSelector = createSelector(
    addLeadViewConnectorsSelector,
    projectIdFromRoute,
    (addLeadViewConnectors, projectId) => addLeadViewConnectors[projectId] || emptyObject,
);

export const addLeadViewConnectorsListSelector = createSelector(
    addLeadViewConnectorsForProjectSelector,
    c => Object.values(c).sort((a, b) => compareString(a.title, b.title)),
);

export const addLeadViewConnectorSelector = createSelector(
    addLeadViewConnectorsForProjectSelector,
    connectorIdFromRoute,
    (connectors, connectorId) => connectors[connectorId] || emptyObject,
);
