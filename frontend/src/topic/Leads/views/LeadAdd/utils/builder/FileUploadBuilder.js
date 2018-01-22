import { UploadBuilder } from '../../../../../../public/utils/upload';
import update from '../../../../../../public/utils/immutable-update';

import {
    urlForUpload,
    createParamsForFileUpload,
} from '../../../../../../common/rest';
import {
    leadsString,
} from '../../../../../../common/constants';

export default class FileUploadBuilder {
    constructor(parent) {
        this.parent = parent;
    }

    createRequest = ({ file, leadId }) => {
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
        this.parent.setState((state) => {
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
        const { addLeadViewLeadChange } = this.parent.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: { id: response.id } },
            upload: {
                title: response.title,
                url: response.file,
            },
        });

        // FOR UPLAOD
        this.parent.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: undefined },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });

        this.parent.uploadCoordinator.notifyComplete(leadId);
    }

    handleLeadUploadFailure = leadId => (response) => {
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.parent.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: undefined },
            formErrors: [`${leadsString.fileUploadFailText} ${response.errors.file[0]}`],
        });

        // FOR UPLAOD
        this.parent.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    progress: { $set: undefined },
                } },
            };
            const leadUploads = update(state.leadUploads, uploadSettings);
            return { leadUploads };
        });

        this.parent.uploadCoordinator.notifyComplete(leadId);
    }

    handleLeadUploadProgress = leadId => (progress) => {
        const theLeadUpload = this.parent.state.leadUploads[leadId];
        if (!theLeadUpload || theLeadUpload.progress === progress) {
            return;
        }
        // FOR UPLAOD
        this.parent.setState((state) => {
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
