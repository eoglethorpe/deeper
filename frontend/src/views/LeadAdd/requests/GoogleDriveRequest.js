import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import schema from '../../../schema';
import { leadAccessor } from '../../../entities/lead';

import {
    urlForGoogleDriveFileUpload,
    createHeaderForGoogleDriveFileUpload,
} from '../../../rest';

export default class GoogleDriveUploadRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            driveUploadCoordinator,
            addLeadViewLeadChange,
            getLeadFromId,
        } = params;

        this.driveUploadCoordinator = driveUploadCoordinator;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.getLeadFromId = getLeadFromId;
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
            const leadValues = leadAccessor.getValues(lead);
            this.addLeadViewLeadChange({
                leadId,
                values: {
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
                const leadDriveRests = update(state.leadDriveRests, uploadSettings);
                return { leadDriveRests };
            });

            this.driveUploadCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.error(err);
        }
    }
}
