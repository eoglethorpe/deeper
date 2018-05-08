import { UploadBuilder } from '../../../vendor/react-store/utils/upload';
import { leadAccessor } from '../../../entities/lead';

import {
    urlForUpload,
    createParamsForFileUpload,
} from '../../../rest';
import _ts from '../../../ts';

export default class FileUploadRequest {
    constructor(params) {
        const {
            uploadCoordinator,
            addLeadViewLeadChange,
            getLeadFromId,
            setLeadUploads,
        } = params;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.uploadCoordinator = uploadCoordinator;
        this.getLeadFromId = getLeadFromId;
        this.setLeadUploads = setLeadUploads;
    }

    create = ({ file, leadId }) => {
        const uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .preLoad(this.handleLeadUploadPreLoad(leadId))
            .progress(this.handleLeadUploadProgress(leadId))
            .success(this.handleLeadUploadSuccess(leadId))
            .failure(this.handleLeadUploadFailure(leadId))
            .fatal(this.handleLeadUploadFailure(leadId))
            .abort(this.handleLeadUploadFailure(leadId))
            .build();
        return uploader;
    }

    // CALLBACKS
    handleLeadUploadPreLoad = leadId => () => {
        this.setLeadUploads({
            leadIds: [leadId],
            value: 0,
        });
    }

    handleLeadUploadSuccess = leadId => (response) => {
        // FOR DATA CHANGE
        const lead = this.getLeadFromId(leadId);
        const leadValues = leadAccessor.getFaramValues(lead);
        this.addLeadViewLeadChange({
            leadId,
            faramValues: {
                ...leadValues,
                attachment: { id: response.id },
            },
            uiState: { serverError: false },
        });

        this.setLeadUploads({
            leadIds: [leadId],
            value: undefined,
        });

        this.uploadCoordinator.notifyComplete(leadId);
    }

    handleLeadUploadFailure = leadId => (response) => {
        // FOR DATA CHANGE
        const lead = this.getLeadFromId(leadId);
        const leadValues = leadAccessor.getFaramValues(lead);
        this.addLeadViewLeadChange({
            leadId,
            faramValues: {
                ...leadValues,
                attachment: undefined,
            },
            faramErrors: {
                $internal: [
                    `${_ts('addLeads', 'fileUploadFailText')} ${response.errors.file[0]}`,
                ],
            },
            uiState: { serverError: false },
        });

        this.setLeadUploads({
            leadIds: [leadId],
            value: undefined,
        });

        this.uploadCoordinator.notifyComplete(leadId);
    }

    handleLeadUploadProgress = leadId => (progress) => {
        this.setLeadUploads({
            leadIds: [leadId],
            value: progress,
        });
    }
}
