import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import schema from '../../../schema';
import { leadAccessor } from '../../../entities/lead';

import {
    urlForGoogleDriveFileUpload,
    createHeaderForGoogleDriveFileUpload,
} from '../../../rest';

export default class GoogleDriveUploadRequest {
    constructor(params) {
        const {
            driveUploadCoordinator,
            addLeadViewLeadChange,
            getLeadFromId,
            setLeadDriveRests,
        } = params;

        this.driveUploadCoordinator = driveUploadCoordinator;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.getLeadFromId = getLeadFromId;
        this.setLeadDriveRests = setLeadDriveRests;
    }

    create = ({ leadId, title, accessToken, fileId, mimeType }) => {
        const googleDriveUploadRequest = new FgRestBuilder()
            .url(urlForGoogleDriveFileUpload)
            .params(createHeaderForGoogleDriveFileUpload({
                title, accessToken, fileId, mimeType,
            }))
            .delay(0)
            .success(this.handleLeadGoogleDriveUploadSuccess(leadId))
            .build();
        return googleDriveUploadRequest;
    }

    handleLeadGoogleDriveUploadSuccess = leadId => (response) => {
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

            this.setLeadDriveRests({
                leadIds: [leadId],
                value: undefined,
            });

            this.driveUploadCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.error(err);
        }
    }
}
