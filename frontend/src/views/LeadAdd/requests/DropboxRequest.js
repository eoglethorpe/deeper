import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import schema from '../../../schema';
import { leadAccessor } from '../../../entities/lead';

import {
    urlForDropboxFileUpload,
    createHeaderForDropboxUpload,
} from '../../../rest';

export default class DropboxRequest {
    constructor(params) {
        const {
            dropboxUploadCoordinator,
            addLeadViewLeadChange,
            getLeadFromId,
            setState,
        } = params;
        this.dropboxUploadCoordinator = dropboxUploadCoordinator;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.getLeadFromId = getLeadFromId;
        this.setState = setState;
    }

    create = ({ leadId, title, fileUrl }) => {
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

            const lead = this.getLeadFromId(leadId);
            const leadValues = leadAccessor.getFaramValues(lead);

            this.addLeadViewLeadChange({
                leadId,
                faramValues: {
                    ...leadValues,
                    attachment: { id: response.id },
                },
                upload: {
                    title: response.title,
                    url: response.file,
                },
                uiState: { pristine: false, serverError: false },
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
