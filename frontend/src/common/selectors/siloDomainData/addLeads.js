import { createSelector } from 'reselect';
import { isObjectEmpty } from '../../../public/utils/common';
import { leadAccessor } from '../../entities/lead';

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
