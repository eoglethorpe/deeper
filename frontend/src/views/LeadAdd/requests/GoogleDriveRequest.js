import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
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
            setState,
        } = params;

        this.driveUploadCoordinator = driveUploadCoordinator;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.getLeadFromId = getLeadFromId;
        this.setState = setState;
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

            // FOR UPLAOD
            this.setState((state) => {
                const uploadSettings = {
                    [leadId]: { $auto: {
                        pending: { $set: undefined },
                    } },
                };
                const leadDriveRests = update(state.leadDriveRests, uploadSettings);
                return { leadDriveRests };
            });

            this.driveUploadCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.error(err);
        }
    }
}
