import {
    iconNames,
} from '../constants';

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
    nonPristine: 'nonPristine',
    complete: 'complete',
    pristine: 'pristine',
};

export const LEAD_FILTER_STATUS = {
    invalid: 'invalid',
    saved: 'saved',
    unsaved: 'unsaved',
};

export const calcLeadState = ({ lead, upload, rest, drive, dropbox }) => {
    const { data, form, uiState } = lead;
    const { values } = form;
    const { pristine, error } = uiState;
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
    } else if (!pristine) {
        return LEAD_STATUS.nonPristine;
    } else if (serverId) {
        return LEAD_STATUS.complete;
    }
    return LEAD_STATUS.pristine;
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


export const mimeType = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    rtf: 'application/rtf',
    text: 'text/plain',
    otf: 'font/otf',
    pdf: 'application/pdf',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    xls: 'application/vnd.ms-excel',
    xlxs: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    png: 'image/png',
    jpeg: 'image/jpeg',
    fig: 'image/fig',
    json: 'application/json',
    xml: 'application/xml',
    msword: 'application/msword',
};

export const leadTypeIconMap = {
    [mimeType.docx]: iconNames.document,
    [mimeType.rtf]: iconNames.document,
    [mimeType.text]: iconNames.documentText,
    [mimeType.otf]: iconNames.document,
    [mimeType.pdf]: iconNames.document,
    [mimeType.pptx]: iconNames.document,
    [mimeType.ppt]: iconNames.document,
    [mimeType.xls]: iconNames.document,
    [mimeType.xlxs]: iconNames.document,
    [mimeType.csv]: iconNames.document,
    [mimeType.png]: iconNames.image,
    [mimeType.jpeg]: iconNames.image,
    [mimeType.fig]: iconNames.document,
    [mimeType.json]: iconNames.document,
    [mimeType.xml]: iconNames.document,
    [mimeType.msword]: iconNames.document,
};
