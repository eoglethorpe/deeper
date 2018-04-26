import { UploadBuilder } from '../../../vendor/react-store/utils/upload';
import update from '../../../vendor/react-store/utils/immutable-update';
import { leadAccessor } from '../../../entities/lead';

import {
    urlForUpload,
    createParamsForFileUpload,
} from '../../../rest';

export default class FileUploadRequest {
    constructor(params) {
        const {
            uploadCoordinator,
            addLeadViewLeadChange,
            leadsStrings,
            getLeadFromId,
            setState,
            getState,
        } = params;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.uploadCoordinator = uploadCoordinator;
        this.leadsStrings = leadsStrings;
        this.getLeadFromId = getLeadFromId;
        this.setState = setState;
        this.getState = getState;
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
        // FOR UPLOAD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: 0 },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
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

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: undefined },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
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
                    `${this.leadsStrings('fileUploadFailText')} ${response.errors.file[0]}`,
                ],
            },
            uiState: { serverError: false },
        });

        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: undefined },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });

        this.uploadCoordinator.notifyComplete(leadId);
    }

    handleLeadUploadProgress = leadId => (progress) => {
        const theLeadUpload = this.getState('leadUploads')[leadId];
        if (!theLeadUpload || theLeadUpload.progress === progress) {
            return;
        }
        // FOR UPLAOD
        this.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: progress },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });
    }
}
