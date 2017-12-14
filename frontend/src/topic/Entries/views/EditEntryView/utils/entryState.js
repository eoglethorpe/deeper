import { randomString } from '../../../../../public/utils/common';
import { ENTRY_STATUS, DIFF_ACTION } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const calcEntryState = ({ entry, rest, deleteRest }) => {
    const { data, uiState } = entry;
    const { stale, error } = uiState;
    const { serverId } = data;

    if ((rest && rest.pending) || (deleteRest && deleteRest.pending)) {
        return ENTRY_STATUS.requesting;
    } else if (error) {
        return ENTRY_STATUS.invalid;
    } else if (!stale) {
        return ENTRY_STATUS.nonstale;
    } else if (serverId) {
        return ENTRY_STATUS.complete;
    }
    return ENTRY_STATUS.stale;
};

export const calcEntriesDiff = (locals, remotes) => {
    const remoteEntriesMap = remotes.reduce(
        (acc, entry) => {
            acc[entry.id] = entry;
            return acc;
        },
        {},
    );
    const actions = locals.reduce(
        (arr, localEntry) => {
            const serverId = localEntry.data.serverId;
            const id = localEntry.data.id;
            const remoteEntry = remoteEntriesMap[serverId];
            if (!serverId) {
                // this localEntry hasn't been saved
                arr.push({ id, action: DIFF_ACTION.noop });
            } else if (!remoteEntry) {
                // this entry is removed from server
                arr.push({ id, serverId, action: DIFF_ACTION.remove });
                // OK: remove
                // SKIP: nothing
            } else if (localEntry.data.versionId < remoteEntry.versionId) {
                // this entry is updated on server
                const entry = remoteEntry;
                const newEntry = {
                    id: localEntry.data.id,
                    serverId: entry.id, // here
                    versionId: entry.versionId,
                    values: {
                        exceprt: entry.excerpt,
                        image: entry.image,
                        lead: entry.lead,
                        analysisFramework: entry.analysisFramework,
                        attribues: entry.attribues,
                        exportData: entry.exportData,
                        filterData: entry.filterData,
                    },
                };
                arr.push({ id, serverId, action: DIFF_ACTION.replace, entry: newEntry });
                // OK: set versionId, generate id, clear uiState
                // SKIP: set versionId
            } else {
                arr.push({ id, serverId, action: DIFF_ACTION.noop });
            }
            return arr;
        },
        [],
    );

    const localEntriesMap = locals.reduce(
        (acc, entry) => {
            if (entry.data.serverId) {
                acc[entry.data.serverId] = true;
            }
            return acc;
        },
        {},
    );
    const actions2 = remotes.reduce(
        (acc, entry) => {
            const serverId = entry.id;
            const localEntry = localEntriesMap[serverId];
            if (!localEntry) {
                // DO: create strucuture
                const newEntry = {
                    id: randomString(),
                    serverId: entry.id, // here
                    values: {
                        excerpt: entry.excerpt,
                        image: entry.image,
                        lead: entry.lead,
                        analysisFramework: entry.analysisFramework,
                        attribues: entry.attribues,
                        exportData: entry.exportData,
                        filterData: entry.filterData,
                    },
                    stale: true,
                };
                acc.push({ serverId, action: DIFF_ACTION.add, entry: newEntry });
            }
            return acc;
        },
        [],
    );

    return [...actions2, ...actions];
};
