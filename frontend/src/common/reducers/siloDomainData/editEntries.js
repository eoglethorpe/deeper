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

// REDUCER

const editEntryViewSetLead = (state, action) => {
    const { lead } = action;
    const leadId = lead.id;
    const settings = {
        editEntryView: {
            [leadId]: { $auto: {
                lead: {
                    $set: lead,
                },
            } },
        },
    };
    // TODO: clear all other leads later
    return update(state, settings);
};

const editEntryViewAddEntry = (state, action) => {
    const { entry, leadId } = action;

    const newEntry = createEntry(entry);

    const settings = {
        editEntryView: {
            [leadId]: { $auto: {
                leadId: { $set: leadId },
                selectedEntryId: { $set: newEntry.data.id },
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

    const index = editEntryView[leadId].entries.findIndex(
        e => e.data.id === entryId,
    );

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [index]: {
                        data: {
                            $merge: data,
                        },
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

    const index = editEntryView[leadId].entries.findIndex(
        e => e.data.id === entryId,
    );

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [index]: {
                        data: {
                            $merge: data,
                        },
                        widget: {
                            values: { $merge: values },
                        },
                        uiState: {
                            $merge: uiState,
                        },
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

    const localEntries = editEntryView[leadId].entries;
    const newEntries = calcNewEntries(localEntries, diffs);

    // If last selected was deleted in newEntries, then set the first item as
    // selected
    let newActiveId = editEntryView[leadId].selectedEntryId;
    const oldSelected = newEntries.find(entry => entry.data.id === newActiveId);
    if (!oldSelected && newEntries.length > 0) {
        newActiveId = newEntries[0].data.id;
    }

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: { $set: newEntries },
                selectedEntryId: { $set: newActiveId },
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

    const index = editEntryView[leadId].entries.findIndex(
        e => e.data.id === entryId,
    );

    const settings = {
        editEntryView: {
            [leadId]: {
                entries: {
                    [index]: {
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

    const entries = editEntryView[leadId].entries;
    const entryIndex = entries.findIndex(d => d.data.id === entryId);

    let newActiveId;
    if (entryIndex + 1 < entries.length) {
        newActiveId = entries[entryIndex + 1].data.id;
    } else if (entryIndex - 1 >= 0) {
        newActiveId = entries[entryIndex - 1].data.id;
    }

    const settings = {
        editEntryView: {
            [leadId]: {
                selectedEntryId: { $set: newActiveId },
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
