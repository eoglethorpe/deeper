import { ENTRY_STATUS } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const calcEntryState = ({ entry, rest }) => {
    const { data, uiState } = entry;
    const { stale, error } = uiState;
    const { serverId } = data;

    if (rest && rest.pending) {
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
