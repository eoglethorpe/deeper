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
            setLeadDropboxRests,
        } = params;
        this.dropboxUploadCoordinator = dropboxUploadCoordinator;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.getLeadFromId = getLeadFromId;
        this.setLeadDropboxRests = setLeadDropboxRests;
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
                uiState: { pristine: false, serverError: false },
            });

            this.setLeadDropboxRests({
                leadIds: [leadId],
                value: undefined,
            });

            this.dropboxUploadCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.error(err);
        }
    }
}
