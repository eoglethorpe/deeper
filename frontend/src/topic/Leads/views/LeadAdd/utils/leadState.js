import { LEAD_TYPE, LEAD_STATUS } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const calcLeadState = ({ lead, upload, rest, drive, dropbox }) => {
    const { serverId, data, form, uiState } = lead;
    const { values } = form;
    const { stale, error } = uiState;
    const { type } = data;

    const isFileUploading = () => upload && upload.progress <= 100;
    const isDriveUploading = () => drive && drive.pending;
    const isDropboxUploading = () => dropbox && dropbox.pending;
    const noAttachment = () => values && !values.attachment;

    if (
        (type === LEAD_TYPE.file && isFileUploading()) ||
        (type === LEAD_TYPE.drive && isDriveUploading()) ||
        (type === LEAD_TYPE.dropbox && isDropboxUploading())
    ) {
        return LEAD_STATUS.uploading;
    } else if (
        (
            type === LEAD_TYPE.file ||
            type === LEAD_TYPE.drive ||
            type === LEAD_TYPE.dropbox
        ) && noAttachment()
    ) {
        return LEAD_STATUS.warning; // invalid
    } else if (rest && rest.pending) {
        return LEAD_STATUS.requesting;
    } else if (error) {
        return LEAD_STATUS.invalid;
    } else if (!stale) {
        return LEAD_STATUS.nonstale;
    } else if (serverId) {
        return LEAD_STATUS.complete;
    }
    return LEAD_STATUS.stale;
};
