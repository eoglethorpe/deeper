import { isFalsy, getElementAround } from '../../../vendor/react-store/utils/common';
import update from '../../../vendor/react-store/utils/immutable-update';
import {
    createEntry,
    calcNewEntries,
    entryAccessor,
} from '../../../entities/entry';

// TYPE

export const EE__ADD_ENTRY = 'siloDomainData/EE__ADD_ENTRY';
export const EE__REMOVE_ENTRY = 'siloDomainData/EE__REMOVE_ENTRY';
export const EE__SET_ACTIVE_ENTRY = 'siloDomainData/EE__SET_ACTIVE_ENTRY';
export const EE__SET_LEAD = 'siloDomainData/EE__SET_LEAD';
export const EE__ENTRY_SAVE = 'siloDomainData/EE__ENTRY_SAVE';
export const EE__ENTRY_CHANGE = 'siloDomainData/EE__ENTRY_CHANGE';
export const EE__ENTRY_DIFF = 'siloDomainData/EE__ENTRY_DIFF';
export const EE__ENTRY_MARK_FOR_DELETE = 'siloDomainData/EE__ENTRY_MARK_FOR_DELETE';
export const EE_REMOVE_ALL_ENTRIES = 'siloDomainData/EE_REMOVE_ALL_ENTRIES';

// CREATOR

export const setEditEntryLeadAction = ({ lead }) => ({
    type: EE__SET_LEAD,
    lead,
});

export const addEntryAction = ({ leadId, entry }) => ({
    type: EE__ADD_ENTRY,
    leadId,
    entry,
});

export const removeEntryAction = ({ leadId, entryId }) => ({
    type: EE__REMOVE_ENTRY,
    leadId,
    entryId,
});

export const removeAllEntriesAction = ({ leadId }) => ({
    type: EE_REMOVE_ALL_ENTRIES,
    leadId,
});

export const saveEntryAction = ({ leadId, entryId, data, values }) => ({
    type: EE__ENTRY_SAVE,
    leadId,
    entryId,
    data,
    values,
});

export const changeEntryAction = ({ leadId, entryId, data, values, colors, uiState }) => ({
    type: EE__ENTRY_CHANGE,
    leadId,
    entryId,
    data,
    values,
    colors,
    uiState,
});

export const diffEntriesAction = ({ leadId, diffs }) => ({
    type: EE__ENTRY_DIFF,
    leadId,
    diffs,
});

export const markForDeleteEntryAction = ({ leadId, entryId, mark }) => ({
    type: EE__ENTRY_MARK_FOR_DELETE,
    leadId,
    entryId,
    mark,
});

export const setActiveEntryAction = ({ leadId, entryId }) => ({
    type: EE__SET_ACTIVE_ENTRY,
    leadId,
    entryId,
});

// HELPER

// FIXME: use accessor for entry
const getIdFromEntry = e => e.data.id;
const getEntriesByLeadId = (editEntry, leadId) => (
    editEntry[leadId].entries
);
const getSelectedEntryIdByLeadId = (editEntry, leadId) => (
    editEntry[leadId].selectedEntryId
);
const getEntryIndexByEntryId = (editEntry, leadId, entryId) => {
    const entries = getEntriesByLeadId(editEntry, leadId);
    return entries.findIndex(e => getIdFromEntry(e) === entryId);
};
const getEntryByEntryId = (editEntry, leadId, entryId) => {
    const entries = getEntriesByLeadId(editEntry, leadId);
    return entries.find(e => getIdFromEntry(e) === entryId);
};

// REDUCER

const editEntrySetLead = (state, action) => {
    const { lead } = action;
    const leadId = lead.id;
    const settings = {
        editEntry: {
            [leadId]: { $auto: {
                lead: { $set: lead },
            } },
        },
    };
    return update(state, settings);
};

const editEntryAddEntry = (state, action) => {
    const { editEntry } = state;
    const { entry, leadId } = action;

    // Add order to entries during creation
    const entries = (editEntry[leadId] || {}).entries || [];
    const maxEntryOrder = entries.reduce(
        (acc, e) => {
            const entryValue = entryAccessor.getValues(e);
            const entryOrder = entryValue.order;
            if (isFalsy(entryOrder)) {
                return acc;
            }
            return Math.max(acc, entryOrder);
        },
        0,
    );

    let { values: { excerpt } } = entry;
    if (isFalsy(excerpt)) {
        excerpt = '';
    }
    const newEntry = createEntry(entry, maxEntryOrder + 1, excerpt);
    const newEntryId = getIdFromEntry(newEntry);

    const settings = {
        editEntry: {
            [leadId]: { $auto: {
                selectedEntryId: { $set: newEntryId },
                entries: { $autoArray: {
                    $push: [newEntry],
                } },
            } },
        },
    };
    return update(state, settings);
};

const editEntrySaveEntry = (state, action) => {
    const { editEntry } = state;
    const {
        leadId,
        entryId,

        data = {},
        values = {},
    } = action;
    const entryIndex = getEntryIndexByEntryId(editEntry, leadId, entryId);

    const settings = {
        editEntry: {
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

const editEntryChangeEntry = (state, action) => {
    const { editEntry } = state;
    const {
        leadId,
        entryId,

        data = {},
        values = {},
        colors = {},
        uiState = {},
    } = action;

    const entryIndex = getEntryIndexByEntryId(editEntry, leadId, entryId);

    const settings = {
        editEntry: {
            [leadId]: {
                entries: {
                    [entryIndex]: {
                        data: { $merge: data },
                        widget: {
                            values: { $merge: values },
                            colors: { $auto: { $merge: colors } },
                        },
                        uiState: { $merge: uiState },
                    },
                },
            },
        },
    };
    return update(state, settings);
};

const editEntryDiffEntries = (state, action) => {
    const { editEntry } = state;
    const {
        leadId,
        diffs,
    } = action;

    const localEntries = getEntriesByLeadId(editEntry, leadId);
    // Create new entires by applying diff on local entries
    const newEntries = calcNewEntries(localEntries, diffs);

    // If last selected was deleted in newEntries,
    // then set the first item as selected
    const selectedEntryId = getSelectedEntryIdByLeadId(editEntry, leadId);
    const selectedEntry = newEntries.find(entry => getIdFromEntry(entry) === selectedEntryId);

    let newSelectedEntryId = selectedEntryId;
    // If selectedEntry is not found, set new selection to first of newEntries
    if (!selectedEntry) {
        newSelectedEntryId = newEntries.length > 0 ? getIdFromEntry(newEntries[0]) : undefined;
    }

    const settings = {
        editEntry: {
            [leadId]: {
                entries: { $set: newEntries },
                selectedEntryId: { $set: newSelectedEntryId },
            },
        },
    };
    return update(state, settings);
};

const entryMarkForDelete = (state, action) => {
    const { editEntry } = state;
    const {
        leadId,
        entryId,
        mark,
    } = action;
    const entryIndex = getEntryIndexByEntryId(editEntry, leadId, entryId);

    // HERE:
    let newSelectedEntryId;
    if (mark) {
        const entries = getEntriesByLeadId(editEntry, leadId);
        const filteredEntries = entries.filter(e => !e.markedForDelete);
        const filteredEntryIndex = filteredEntries.findIndex(e => getIdFromEntry(e) === entryId);
        const newSelectedEntry = getElementAround(filteredEntries, filteredEntryIndex);
        newSelectedEntryId = newSelectedEntry ? getIdFromEntry(newSelectedEntry) : undefined;
    } else {
        newSelectedEntryId = entryId;
    }

    const settings = {
        editEntry: {
            [leadId]: {
                selectedEntryId: { $set: newSelectedEntryId },
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

const editEntryRemoveEntry = (state, action) => {
    const { editEntry } = state;
    const { entryId, leadId } = action;

    // Get new selected entry id
    const entryIndex = getEntryIndexByEntryId(editEntry, leadId, entryId);
    const entries = getEntriesByLeadId(editEntry, leadId);

    const newSelectedEntry = getElementAround(entries, entryIndex);
    const newSelectedEntryId = newSelectedEntry ? getIdFromEntry(newSelectedEntry) : undefined;

    const settings = {
        editEntry: {
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

const editEntryRemoveAllEntries = (state, action) => {
    const { leadId } = action;

    const settings = {
        editEntry: {
            [leadId]: {
                selectedEntryId: { $set: undefined },
                entries: {
                    $set: [],
                },
            },
        },
    };
    return update(state, settings);
};

const editEntrySetActiveEntry = (state, action) => {
    const { editEntry } = state;
    const { leadId, entryId } = action;

    const entry = getEntryByEntryId(editEntry, leadId, entryId);
    if (entry.markedForDelete) {
        return state;
    }

    const settings = {
        editEntry: {
            [leadId]: {
                selectedEntryId: {
                    $set: entryId,
                },
            },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [EE__ADD_ENTRY]: editEntryAddEntry,
    [EE__REMOVE_ENTRY]: editEntryRemoveEntry,
    [EE__SET_ACTIVE_ENTRY]: editEntrySetActiveEntry,
    [EE__SET_LEAD]: editEntrySetLead,
    [EE__ENTRY_SAVE]: editEntrySaveEntry,
    [EE__ENTRY_CHANGE]: editEntryChangeEntry,
    [EE__ENTRY_DIFF]: editEntryDiffEntries,
    [EE__ENTRY_MARK_FOR_DELETE]: entryMarkForDelete,
    [EE_REMOVE_ALL_ENTRIES]: editEntryRemoveAllEntries,
};
export default reducers;
