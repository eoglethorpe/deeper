import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import schema from '../../../schema';

import {
    urlForDropboxFileUpload,
    createHeaderForDropboxUpload,
} from '../../../rest';

export default class DropboxBuilder {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            dropboxUploadCoordinator,
            addLeadViewLeadChange,
        } = params;
        this.dropboxUploadCoordinator = dropboxUploadCoordinator;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
    }


    createRequest = ({ leadId, title, fileUrl }) => {
        const dropboxUploadRequest = new FgRestBuilder()
            .url(urlForDropboxFileUpload)
            .params(createHeaderForDropboxUpload({ title, fileUrl }))
            .delay(0)
            .success(this.handleLeadDropboxUploadSuccess(leadId))
            .build();
        return dropboxUploadRequest;
    }

    handleLeadDropboxUploadSuccess = leadId => (response) => {
        // FOR DATA CHANGE
        try {
            schema.validate(response, 'galleryFile');

            this.addLeadViewLeadChange({
                leadId,
                values: { attachment: { id: response.id } },
                upload: {
                    title: response.title,
                    url: response.file,
                },
                uiState: { pristine: false },
            });

            // FOR UPLAOD
            this.setState((state) => {
                const uploadSettings = {
                    [leadId]: { $auto: {
                        pending: { $set: undefined },
                    } },
                };
                const leadDropboxRests = update(state.leadDropboxRests, uploadSettings);
                return { leadDropboxRests };
            });

            this.dropboxUploadCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.error(err);
        }
    }
}
