import { UploadBuilder } from '../../../vendor/react-store/utils/upload';
import update from '../../../vendor/react-store/utils/immutable-update';

import {
    urlForUpload,
    createParamsForFileUpload,
} from '../../../rest';

export default class FileUploadRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };
        this.getState = name => parent.state[name];

        const {
            uploadCoordinator,
            addLeadViewLeadChange,
            leadsStrings,
        } = params;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.uploadCoordinator = uploadCoordinator;
        this.leadsStrings = leadsStrings;
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
        this.addLeadViewLeadChange({
            leadId,
            values: { attachment: { id: response.id } },
            upload: {
                title: response.title,
                url: response.file,
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
        this.addLeadViewLeadChange({
            leadId,
            values: { attachment: undefined },
            formErrors: [`${this.leadsStrings('fileUploadFailText')} ${response.errors.file[0]}`],
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
