import update from '../vendor/react-store/utils/immutable-update';
import { iconNames } from '../constants';

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
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    fig: 'image/fig',
    json: 'application/json',
    xml: 'application/xml',
    msword: 'application/msword',
};

export const LEAD_PANE_TYPE = {
    txt: 'txt',
    csv: 'csv',
    json: 'json',
    xml: 'xml',

    word: 'word',
    pdf: 'pdf',
    presentation: 'presentation',
    spreadsheet: 'spreadsheet',
    image: 'image',

    text: 'text',
    website: 'website',
};

export const leadPaneTypeMap = {
    [mimeType.text]: LEAD_PANE_TYPE.txt,
    [mimeType.csv]: LEAD_PANE_TYPE.csv,
    [mimeType.json]: LEAD_PANE_TYPE.json,
    [mimeType.xml]: LEAD_PANE_TYPE.xml,

    [mimeType.docx]: LEAD_PANE_TYPE.word,
    [mimeType.rtf]: LEAD_PANE_TYPE.word,
    [mimeType.otf]: LEAD_PANE_TYPE.word,
    [mimeType.msword]: LEAD_PANE_TYPE.word,

    [mimeType.pdf]: LEAD_PANE_TYPE.pdf,

    [mimeType.pptx]: LEAD_PANE_TYPE.presentation,
    [mimeType.ppt]: LEAD_PANE_TYPE.presentation,

    [mimeType.xls]: LEAD_PANE_TYPE.spreadsheet,
    [mimeType.xlxs]: LEAD_PANE_TYPE.spreadsheet,

    [mimeType.png]: LEAD_PANE_TYPE.image,
    [mimeType.jpg]: LEAD_PANE_TYPE.image,
    [mimeType.jpeg]: LEAD_PANE_TYPE.image,
    [mimeType.fig]: LEAD_PANE_TYPE.image,
};

export const leadTypeIconMap = {
    [mimeType.text]: iconNames.documentText,

    [mimeType.docx]: iconNames.docx,
    [mimeType.rtf]: iconNames.rtf,
    [mimeType.otf]: iconNames.otf,
    [mimeType.msword]: iconNames.msword,

    [mimeType.pdf]: iconNames.pdf,

    [mimeType.pptx]: iconNames.pptx,
    [mimeType.ppt]: iconNames.ppt,

    [mimeType.xls]: iconNames.xls,
    [mimeType.xlxs]: iconNames.xlxs,

    [mimeType.csv]: iconNames.csv,

    [mimeType.png]: iconNames.png,
    [mimeType.jpg]: iconNames.jpg,
    [mimeType.jpeg]: iconNames.jpeg,
    [mimeType.fig]: iconNames.fig,

    [mimeType.json]: iconNames.json,
    [mimeType.xml]: iconNames.xml,
};

export const leadAccessor = {
    getKey: lead => lead.data && lead.data.id,
    getServerId: lead => lead.data && lead.data.serverId,
    getType: lead => lead.form && lead.form.values && lead.form.values.sourceType,

    getValues: lead => lead.form && lead.form.values,
    getErrors: lead => lead.form && lead.form.errors,
    getFieldErrors: lead => lead.form && lead.form.fieldErrors,

    getUiState: lead => lead.uiState,
    hasServerError: lead => !!lead.uiState && lead.uiState.serverError,
};

const leadReference = {
    data: {
        id: 'lead-0',
        serverId: undefined,
    },
    form: {
        values: {
            title: 'Lead #0',
            project: 0,
        },
        errors: {},
        fieldErrors: {},
    },
    uiState: {
        error: false,
        pristine: false,
    },
};

export const createLead = ({ id, serverId, values = {}, pristine = false }) => {
    const settings = {
        data: {
            id: { $set: id },
            serverId: { $set: serverId },
        },
        form: {
            values: { $set: values },
        },
        uiState: {
            pristine: { $set: pristine },
        },
    };
    return update(leadReference, settings);
};

export const calcLeadState = ({ lead, upload, rest, drive, dropbox }) => {
    const type = leadAccessor.getType(lead);
    const serverId = leadAccessor.getServerId(lead);
    const values = leadAccessor.getValues(lead);
    const { pristine, error } = leadAccessor.getUiState(lead);

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
