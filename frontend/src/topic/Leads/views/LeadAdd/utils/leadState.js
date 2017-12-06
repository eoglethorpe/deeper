// eslint-disable-next-line import/prefer-default-export
export const calcLeadState = ({ lead, upload, rest }) => {
    const { serverId, data, form, uiState } = lead;
    const { values } = form;
    const { stale, error } = uiState;
    const { type } = data;

    if (type === 'file' && upload && upload.progress <= 100) {
        return 'uploading';
    } else if (type === 'file' && (values && !values.attachment)) {
        return 'warning'; // invalid
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
