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
