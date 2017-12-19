import update from '../../../public/utils/immutable-update';
import {
    EE__ADD_ENTRY,
    EE__REMOVE_ENTRY,
    EE__SET_ACTIVE_ENTRY,
    EE__SET_LEAD,
    EE__ENTRY_SAVE,
    EE__ENTRY_CHANGE,
    EE__ENTRY_DIFF,
    EE__ENTRY_MARK_FOR_DELETE,
} from '../../action-types/siloDomainData';

import {
    createEntry,
    calcNewEntries,
} from '../../entities/entry';

// HELPER


const getIdFromEntry = e => e.data.id;
const getEntriesByLeadId = (editEntryView, leadId) => (
    editEntryView[leadId].entries
);
const getSelectedEntryIdByLeadId = (editEntryView, leadId) => (
    editEntryView[leadId].selectedEntryId
);
const getEntryIndexByEntryId = (editEntryView, leadId, entryId) => {
    const entries = getEntriesByLeadId(editEntryView, leadId);
    return entries.findIndex(e => getIdFromEntry(e) === entryId);
};

// REDUCER

const editEntryViewSetLead = (state, action) => {
    const { lead } = action;
    const leadId = lead.id;
    const settings = {
        editEntryView: {
            [leadId]: { $auto: {
                // NOTE: why not setting leadId here?
                lead: { $set: lead },
            } },
        },
    };
    return update(state, settings);
};

const editEntryViewAddEntry = (state, action) => {
    const { entry, leadId } = action;
    const newEntry = createEntry(entry);
    const newEntryId = getIdFromEntry(newEntry);

    const settings = {
        editEntryView: {
            [leadId]: { $auto: {
                leadId: { $set: leadId },
                selectedEntryId: { $set: newEntryId },
                entries: { $autoArray: {
                    $unshift: [newEntry],
                } },
            } },
        },
    };
    return update(state, settings);
};


const editEntryViewSaveEntry = (state, action) => {
    const { editEntryView } = state;
    const {
        leadId,
        entryId,

        data = {},
        values = {},
    } = action;
    const entryIndex = getEntryIndexByEntryId(editEntryView, leadId, entryId);

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: { $merge: data },
                        widget: {
                            values: { $merge: values },
                        },
                        uiState: {
                            pristine: { $set: true },
                            error: { $set: false },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryViewChangeEntry = (state, action) => {
    const { editEntryView } = state;
    const {
        leadId,
        entryId,

        data = {},
        values = {},
        uiState = {},
    } = action;

    const entryIndex = getEntryIndexByEntryId(editEntryView, leadId, entryId);

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: { $merge: data },
                        widget: {
                            values: { $merge: values },
                        },
                        uiState: { $merge: uiState },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryViewDiffEntries = (state, action) => {
    const { editEntryView } = state;
    const {
        leadId,
        diffs,
    } = action;

    const localEntries = getEntriesByLeadId(editEntryView, leadId);
    // Create new entires by applying diff on local entries
    const newEntries = calcNewEntries(localEntries, diffs);

    // If last selected was deleted in newEntries,
    // then set the first item as selected
    const selectedEntryId = getSelectedEntryIdByLeadId(editEntryView, leadId);
    const selectedEntry = newEntries.find(entry => getIdFromEntry(entry) === selectedEntryId);

    let newSelectedEntryId = selectedEntryId;
    // If selectedEntry is not found, set new selection to first of newEntries
    if (!selectedEntry) {
        newSelectedEntryId = newEntries.length > 0 ? getIdFromEntry(newEntries[0]) : undefined;
    }

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: { $set: newEntries },
                selectedEntryId: { $set: newSelectedEntryId },
            },
        },
    };
    return update(state, settings);
};

const entryMarkForDelete = (state, action) => {
    const { editEntryView } = state;
    const {
        leadId,
        entryId,
        mark,
    } = action;
    const entryIndex = getEntryIndexByEntryId(editEntryView, leadId, entryId);

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        markedForDelete: { $set: mark },
                        uiState: {
                            pristine: { $set: false },
                            error: { $set: false },
                        },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryViewRemoveEntry = (state, action) => {
    const { editEntryView } = state;
    const { entryId, leadId } = action;

    const entryIndex = getEntryIndexByEntryId(editEntryView, leadId, entryId);
    const entries = getEntriesByLeadId(editEntryView, leadId);

    let newSelectedEntryId;
    if (entryIndex + 1 < entries.length) {
        newSelectedEntryId = getIdFromEntry(entries[entryIndex + 1]);
    } else if (entryIndex - 1 >= 0) {
        newSelectedEntryId = getIdFromEntry(entries[entryIndex - 1]);
    }

    const settings = {
        editEntryView: {
            [leadId]: {
                selectedEntryId: { $set: newSelectedEntryId },
                entries: {
                    $splice: [[entryIndex, 1]],
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryViewSetActiveEntry = (state, action) => {
    const { leadId, entryId } = action;
    const settings = {
        editEntryView: {
            [leadId]: {
                selectedEntryId: { $set: entryId },
            },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [EE__ADD_ENTRY]: editEntryViewAddEntry,
    [EE__REMOVE_ENTRY]: editEntryViewRemoveEntry,
    [EE__SET_ACTIVE_ENTRY]: editEntryViewSetActiveEntry,
    [EE__SET_LEAD]: editEntryViewSetLead,
    [EE__ENTRY_SAVE]: editEntryViewSaveEntry,
    [EE__ENTRY_CHANGE]: editEntryViewChangeEntry,
    [EE__ENTRY_DIFF]: editEntryViewDiffEntries,
    [EE__ENTRY_MARK_FOR_DELETE]: entryMarkForDelete,
};
export default reducers;
