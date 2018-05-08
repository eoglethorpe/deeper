import { createSelector } from 'reselect';
import {
    isObjectEmpty,
    compareString,
    caseInsensitiveSubmatch,
} from '../../../vendor/react-store/utils/common';
import {
    projectIdFromRoute,
    connectorIdFromRoute,
} from '../domainData';
import {
    LEAD_FILTER_STATUS,
    LEAD_STATUS,
    calcLeadState,
    leadAccessor,
} from '../../../entities/lead';

const emptyList = [];
const emptyObject = {};

// HELPER

const createFilterFn = (leadsStatus, { search, type, source, status }) => (lead) => {
    // FIXME: static method statusMatches was undefined, so moved it here
    const statusMatches = (leadStatus, stat) => {
        switch (stat) {
            case LEAD_FILTER_STATUS.invalid:
                return (
                    leadStatus === LEAD_STATUS.invalid ||
                    leadStatus === LEAD_STATUS.warning
                );
            case LEAD_FILTER_STATUS.saved:
                return leadStatus === LEAD_STATUS.complete;
            case LEAD_FILTER_STATUS.unsaved:
                return (
                    leadStatus === LEAD_STATUS.nonPristine ||
                    leadStatus === LEAD_STATUS.uploading ||
                    leadStatus === LEAD_STATUS.requesting
                );
            default:
                return false;
        }
    };

    const id = leadAccessor.getKey(lead);
    const leadType = leadAccessor.getType(lead);
    const {
        title: leadTitle = '',
        source: leadSource = '',
    } = leadAccessor.getFaramValues(lead);

    const leadStatus = leadsStatus[id].leadState;

    if (search && !caseInsensitiveSubmatch(leadTitle, search)) {
        return false;
    } else if (source && !caseInsensitiveSubmatch(leadSource, source)) {
        return false;
    } else if (type && type.length > 0 && type.indexOf(leadType) === -1) {
        return false;
    } else if (status && status.length > 0 && !statusMatches(leadStatus, status)) {
        return false;
    }
    return true;
};

const isSomeSaveEnabled = (list, leadStates) => (
    list.some(key => !(leadStates[key].isSaveDisabled))
);

const isSomeRemoveEnabled = (list, leadStates) => (
    list.some(key => !(leadStates[key].isRemoveDisabled))
);

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

export const addLeadViewRemoveModalStateSelector = createSelector(
    addLeadViewSelector,
    addLeadView => addLeadView.removeModalState || emptyObject,
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

export const addLeadViewLeadKeysSelector = createSelector(
    addLeadViewLeadsSelector,
    leads => leads.map(leadAccessor.getKey),
);

export const addLeadViewLeadStatesSelector = createSelector(
    // TODO: distribute this later
    addLeadViewLeadRestsSelector,
    addLeadViewLeadUploadsSelector,
    addLeadViewLeadDriveRestsSelector,
    addLeadViewLeadDropboxRestsSelector,
    addLeadViewLeadsSelector,
    (leadRests, leadUploads, leadDriveRests, leadDropboxRests, leads) => (
        leads.reduce(
            (acc, lead) => {
                const leadId = leadAccessor.getKey(lead);
                const serverError = leadAccessor.hasServerError(lead);
                const leadState = calcLeadState({
                    lead,
                    rest: leadRests[leadId],
                    upload: leadUploads[leadId],
                    drive: leadDriveRests[leadId],
                    dropbox: leadDropboxRests[leadId],
                });

                // NOTE: for serverError save must be enabled
                const isSaveDisabled = !(
                    leadState === LEAD_STATUS.nonPristine ||
                    (LEAD_STATUS.invalid && serverError)
                );
                const isRemoveDisabled = (leadState === LEAD_STATUS.requesting);
                const isFormLoading = (leadState === LEAD_STATUS.requesting);
                const isFormDisabled = (
                    leadState === LEAD_STATUS.requesting ||
                    leadState === LEAD_STATUS.warning
                );
                acc[leadId] = {
                    leadState,
                    isSaveDisabled,
                    isFormDisabled,
                    isFormLoading,
                    isRemoveDisabled,
                };
                return acc;
            },
            {},
        )
    ),
);

export const addLeadViewFilteredLeadsSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewLeadStatesSelector,
    addLeadViewFiltersSelector,
    (leads, leadStates, filters) => {
        const filterFn = createFilterFn(leadStates, filters);
        return leads.filter(filterFn);
    },
);
export const addLeadViewFilteredLeadKeysSelector = createSelector(
    addLeadViewFilteredLeadsSelector,
    leads => leads.map(leadAccessor.getKey),
);
export const addLeadViewCompletedLeadsSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewLeadStatesSelector,
    (leads, leadStates) => {
        const filterFn = createFilterFn(leadStates, { status: LEAD_FILTER_STATUS.saved });
        return leads.filter(filterFn);
    },
);
export const addLeadViewCompletedLeadKeysSelector = createSelector(
    addLeadViewCompletedLeadsSelector,
    leads => leads.map(leadAccessor.getKey),
);
export const addLeadViewButtonStatesSelector = createSelector(
    addLeadViewIsFilterEmptySelector,
    addLeadViewLeadStatesSelector,
    addLeadViewLeadKeysSelector,
    addLeadViewFilteredLeadKeysSelector,
    addLeadViewCompletedLeadKeysSelector,
    (
        isFilterEmpty, leadStates, leadKeys, filteredLeadKeys, completedLeadKeys,
    ) => {
        // if something change
        const allEnabled = (
            leadKeys.length >= 1
        );
        const filteredEnabled = (
            !isFilterEmpty &&
            filteredLeadKeys.length >= 1
        );
        const completedEnabled = (
            completedLeadKeys.length >= 1
        );

        // identify if save is enabled for all-leads
        const isSaveEnabledForAll = (
            allEnabled &&
            isSomeSaveEnabled(leadKeys, leadStates)
        );
        const isRemoveEnabledForAll = (
            allEnabled &&
            isSomeRemoveEnabled(leadKeys, leadStates)
        );

        // identify is save is enabled for filtered-leads
        const isSaveEnabledForFiltered = (
            filteredEnabled &&
            isSomeSaveEnabled(filteredLeadKeys, leadStates)
        );

        const isRemoveEnabledForFiltered = (
            filteredEnabled &&
            isSomeRemoveEnabled(filteredLeadKeys, leadStates)
        );

        const isRemoveEnabledForCompleted = (
            completedEnabled
        );

        return {
            isSaveEnabledForAll,
            isRemoveEnabledForAll,
            isSaveEnabledForFiltered,
            isRemoveEnabledForFiltered,
            isRemoveEnabledForCompleted,
        };
    },
);

export const addLeadViewActiveLeadSelector = createSelector(
    addLeadViewLeadsSelector,
    addLeadViewActiveLeadIdSelector,
    (leads, activeLeadId) => leads.find(
        lead => leadAccessor.getKey(lead) === activeLeadId,
    ),
);

export const addLeadViewHasActiveLeadSelector = createSelector(
    addLeadViewActiveLeadSelector,
    lead => lead !== undefined,
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
