import { getElementAround } from '../../../public/utils/common';
import update from '../../../public/utils/immutable-update';
import {
    createEntry,
    calcNewEntries,
} from '../../entities/entry';

// TYPE

export const EE__ADD_ENTRY = 'domain-data/EE__ADD_ENTRY';
export const EE__REMOVE_ENTRY = 'domain-data/EE__REMOVE_ENTRY';
export const EE__SET_ACTIVE_ENTRY = 'domain-data/EE__SET_ACTIVE_ENTRY';
export const EE__SET_LEAD = 'silo-domain-data/EE__SET_LEAD';
export const EE__ENTRY_SAVE = 'domain-data/EE__ENTRY_SAVE';
export const EE__ENTRY_CHANGE = 'domain-data/EE__ENTRY_CHANGE';
export const EE__ENTRY_DIFF = 'domain-data/EE__ENTRY_DIFF';
export const EE__ENTRY_MARK_FOR_DELETE = 'domain-data/EE__ENTRY_MARK_FOR_DELETE';
export const EE_REMOVE_ALL_ENTRIES = 'domain-data/EE_REMOVE_ALL_ENTRIES';

// CREATOR

export const setEditEntryViewLeadAction = ({ lead }) => ({
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
                // FIXME: why not setting leadId here?
                // but setting it on addEntry
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
                // FIXME: why are we setting leadId here
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
        colors = {},
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

    // Get new selected entry id
    const entryIndex = getEntryIndexByEntryId(editEntryView, leadId, entryId);
    const entries = getEntriesByLeadId(editEntryView, leadId);

    const newSelectedEntry = getElementAround(entries, entryIndex);
    const newSelectedEntryId = newSelectedEntry ? getIdFromEntry(newSelectedEntry) : undefined;

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

const editEntryViewRemoveAllEntries = (state, action) => {
    const { leadId } = action;

    const settings = {
        editEntryView: {
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
    [EE_REMOVE_ALL_ENTRIES]: editEntryViewRemoveAllEntries,
};
export default reducers;
