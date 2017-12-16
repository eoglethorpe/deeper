export const LEAD_TYPE = {
    dropbox: 'dropbox',
    drive: 'google-drive',
    file: 'disk',
    website: 'website',
    text: 'text',
};

export const ATTACHMENT_TYPES = [
    LEAD_TYPE.file,
    LEAD_TYPE.dropbox,
    LEAD_TYPE.drive,
];

export const LEAD_STATUS = {
    uploading: 'uploading',
    warning: 'warning',
    requesting: 'requesting',
    invalid: 'invalid',
    nonstale: 'nonstale',
    complete: 'complete',
    stale: 'stale',
};

export const LEAD_FILTER_STATUS = {
    invalid: 'invalid',
    saved: 'saved',
    unsaved: 'unsaved',
};

export const calcLeadState = ({ lead, upload, rest, drive, dropbox }) => {
    const { data, form, uiState } = lead;
    const { values } = form;
    const { stale, error } = uiState;
    const { type, serverId } = data;

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
        noAttachment() && (
            type === LEAD_TYPE.file ||
            type === LEAD_TYPE.drive ||
            type === LEAD_TYPE.dropbox
        )
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

export const leadAccessor = {
    getKey: lead => lead.data && lead.data.id,
    getServerId: lead => lead.data && lead.data.serverId,
    getType: lead => lead.data && lead.data.type,

    getValues: lead => lead.form && lead.form.values,
    getErrors: lead => lead.form && lead.form.errors,
    getFieldErrors: lead => lead.form && lead.form.fieldErrors,

    getUiState: lead => lead.uiState,
};
