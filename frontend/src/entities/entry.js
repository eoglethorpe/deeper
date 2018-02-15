import update from '../vendor/react-store/utils/immutable-update';
import {
    listToMap,
    randomString,
    compareDate,
    compareNumber,
    isTruthy,
} from '../vendor/react-store/utils/common';

export const ENTRY_STATUS = {
    // A rest request is in session
    requesting: 'requesting',
    // Error occured and it cannot be recovered
    invalid: 'invalid',
    // Some changed has occured
    nonPristine: 'nonPristine',
    // No change has occured and saved in server
    complete: 'complete',
    // Some change has occured
    pristine: 'pristine',
};

export const DIFF_ACTION = {
    // do nothing to the local state
    noop: 'noop',
    // add it to list of entry in local state
    add: 'add',
    // remote it from the list of entry in local state
    remove: 'remove',
    // update it to the list of entry in local state
    replace: 'replace',
};

export const entryAccessor = {
    isMarkedForDelete: entry => entry.markedForDelete,

    getData: entry => entry.data,
    getKey: entry => entry.data && entry.data.id,
    getServerId: entry => entry.data && entry.data.serverId,
    getVersionId: entry => entry.data && entry.data.serverId,

    getWidget: entry => entry.widget,
    getValues: entry => entry.widget && entry.widget.values,
    getColors: entry => entry.widget && entry.widget.colors,

    getUiState: entry => entry.uiState,
    getError: entry => entry.uiState && entry.uiState.error,
    getPristine: entry => entry.uiState && entry.uiState.pristine,
};

const entryReference = {
    data: {
        id: 'entry-0',
        serverId: undefined,
        versionId: undefined,
    },
    widget: {
        values: { },
    },
    uiState: {
        error: false,
        pristine: false,
    },
};

export const createEntry = ({
    id, serverId, versionId, values = {}, pristine = false, error = false,
}, order = undefined, excerpt = undefined) => {
    let newValues = values;
    if (isTruthy(order)) {
        newValues = { ...newValues, order };
    }
    if (isTruthy(excerpt)) {
        newValues = { ...newValues, excerpt };
    }
    const settings = {
        data: {
            id: { $set: id },
            serverId: { $set: serverId },
            versionId: { $set: versionId },
        },
        widget: {
            values: { $set: newValues },
        },
        uiState: {
            pristine: { $set: pristine },
            error: { $set: error },
        },
    };
    return update(entryReference, settings);
};

// Get the current state of a entry with rest-request information
export const calcEntryState = ({ entry, rest, deleteRest }) => {
    const serverId = entryAccessor.getServerId(entry);
    const pristine = entryAccessor.getPristine(entry);
    const error = entryAccessor.getError(entry);

    if ((rest && rest.pending) || (deleteRest && deleteRest.pending)) {
        return ENTRY_STATUS.requesting;
    } else if (error) {
        return ENTRY_STATUS.invalid;
    } else if (!pristine) {
        return ENTRY_STATUS.nonPristine;
    } else if (serverId) {
        return ENTRY_STATUS.complete;
    }
    return ENTRY_STATUS.pristine;
};

const getValuesFromRemoteEntry = ({
    excerpt,
    image,
    lead,
    analysisFramework,
    attributes,
    exportData,
    filterData,
    order,
    createdAt,
}) => ({
    excerpt,
    image,
    lead,
    analysisFramework,
    attributes,
    exportData,
    filterData,
    order,
    createdAt,
});

export const calcEntriesDiff = (locals, remotes) => {
    const localEntriesMap = listToMap(
        locals,
        entryAccessor.getServerId,
        (entry, key) => (key ? true : undefined),
    );
    const actionsFoo = remotes.reduce(
        (acc, remoteEntry) => {
            const {
                id: remoteServerId,
                versionId: remoteVersionId,
            } = remoteEntry;

            const localEntry = localEntriesMap[remoteServerId];
            if (!localEntry) {
                // new remote entry has been added
                const localId = randomString();
                const remoteValues = getValuesFromRemoteEntry(remoteEntry);
                const newEntry = createEntry({
                    id: localId,
                    serverId: remoteServerId,
                    versionId: remoteVersionId,
                    values: remoteValues,
                    pristine: true,
                    error: false,
                });
                acc.push({
                    serverId: remoteServerId,
                    action: DIFF_ACTION.add,
                    entry: newEntry,
                });
            }
            return acc;
        },
        [],
    );

    const remoteEntriesMap = listToMap(remotes, remoteEntry => remoteEntry.id);
    const actionsBar = locals.reduce(
        (arr, localEntry) => {
            const localId = entryAccessor.getKey(localEntry);
            const localServerId = entryAccessor.getServerId(localEntry);
            const localVersionId = entryAccessor.getVersionId(localEntry);

            // get remote enty with same serverId as current local entry
            const remoteEntry = remoteEntriesMap[localServerId];
            if (!localServerId) {
                // this local entry hasn't been saved
                arr.push({
                    id: localId,
                    action: DIFF_ACTION.noop,
                });
            } else if (!remoteEntry) {
                // this entry is removed from server
                arr.push({
                    id: localId,
                    serverId: localServerId,
                    action: DIFF_ACTION.remove,
                });
            } else if (localVersionId < remoteEntry.versionId) {
                // this entry is updated on server
                const { versionId: remoteVersionId } = remoteEntry;
                const remoteValues = getValuesFromRemoteEntry(remoteEntry);
                const newEntry = createEntry({
                    id: localId,
                    serverId: localServerId, // here
                    versionId: remoteVersionId,
                    values: remoteValues,
                    pristine: true,
                    error: false,
                });

                const localPristine = entryAccessor.getPristine(localEntry);
                const localError = entryAccessor.getError(localEntry);
                const localValues = entryAccessor.getValues(localEntry);
                const newEntryOnSkip = createEntry({
                    id: localId,
                    serverId: localServerId,
                    versionId: remoteVersionId,
                    values: localValues,
                    state: localPristine,
                    error: localError,
                });
                arr.push({
                    id: localId,
                    serverId: localServerId,
                    action: DIFF_ACTION.replace,
                    entry: newEntry,
                    entryOnSkip: newEntryOnSkip,
                });
            } else {
                // the entry hasn't changed on server
                arr.push({
                    id: localId,
                    serverId: localServerId,
                    action: DIFF_ACTION.noop,
                });
            }
            return arr;
        },
        [],
    );

    return [...actionsFoo, ...actionsBar];
};

export const getApplicableDiffs = diffs => diffs.filter(
    diff => diff.action !== DIFF_ACTION.noop && !diff.skip,
);

export const getApplicableDiffCount = diffs => getApplicableDiffs(diffs).length;

export const getApplicableAndModifyingDiffs = diffs => (
    getApplicableDiffs(diffs).filter(diff => diff.action !== DIFF_ACTION.add)
);

export const getApplicableAndModifyingDiffCount = diffs => (
    getApplicableDiffs(diffs).filter(diff => diff.action !== DIFF_ACTION.add)
);

export const calcNewEntries = (localEntries = [], diffs = []) => (
    diffs
        .reduce(
            (acc, diff) => {
                const index = localEntries.findIndex(e => e.data.id === diff.id);
                switch (diff.action) {
                    case DIFF_ACTION.add: {
                        const remoteEntry = diff.entry;
                        if (!diff.skip) {
                            acc.push(remoteEntry);
                        } // else don't push
                        break;
                    }
                    case DIFF_ACTION.remove:
                        if (diff.skip) {
                            acc.push(localEntries[index]);
                        } // else skip adding to push
                        break;
                    case DIFF_ACTION.replace: {
                        if (!diff.skip) {
                            acc.push(diff.entry);
                        } else {
                            acc.push(diff.entryOnSkip);
                        }
                        break;
                    }
                    case DIFF_ACTION.noop: {
                        // push as it is
                        acc.push(localEntries[index]);
                        break;
                    }
                    default:
                        console.warn(`Error: action not valid ${diff.action}`);
                        break;
                }
                return acc;
            },
            [],
        )
        .map((a) => {
            console.warn(a);
            return a;
        })
        .sort((a, b) => {
            const aValue = entryAccessor.getValues(a);
            const aOrder = aValue.order;
            const aCreatedAt = aValue.createdAt;

            const bValue = entryAccessor.getValues(b);
            const bOrder = bValue.order;
            const bCreatedAt = bValue.createdAt;

            return compareNumber(aOrder, bOrder, -1) || compareDate(aCreatedAt, bCreatedAt, -1);
        })
);
