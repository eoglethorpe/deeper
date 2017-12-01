// eslint-disable-next-line import/prefer-default-export
export const calcLeadState = ({ lead, upload, rest }) => {
    const { serverId, data, uiState, upload: uploadData } = lead;
    const { stale, error } = uiState;
    const { type } = data;

    if (type === 'file' && !upload && !uploadData.url) {
        return 'warning'; // invalid
    } else if (type === 'file' && upload && upload.progress < 100) {
        return 'uploading';
    } else if (rest && rest.pending) {
        return 'requesting';
    } else if (error) {
        return 'invalid';
    } else if (!stale) {
        return 'nonstale';
    } else if (serverId) {
        return 'complete';
    }
    return 'stale';
};
