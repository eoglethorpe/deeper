import { LEAD_TYPE, LEAD_STATUS } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const calcLeadState = ({ lead, upload, rest }) => {
    const { serverId, data, form, uiState } = lead;
    const { values } = form;
    const { stale, error } = uiState;
    const { type } = data;

    if (type === LEAD_TYPE.file && upload && upload.progress <= 100) {
        return LEAD_STATUS.uploading;
    } else if (type === LEAD_TYPE.file && (values && !values.attachment)) {
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
