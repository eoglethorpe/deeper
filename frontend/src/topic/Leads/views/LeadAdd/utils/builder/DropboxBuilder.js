import { FgRestBuilder } from '../../../../../../public/utils/rest';
import update from '../../../../../../public/utils/immutable-update';

import {
    urlForDropboxFileUpload,
    createHeaderForDropboxUpload,
} from '../../../../../../common/rest';

export default class DropboxBuilder {
    constructor(parent) {
        this.parent = parent;
    }

    createRequest = ({ leadId, title, fileUrl }) => {
        const dropboxUploadRequest = new FgRestBuilder()
            .url(urlForDropboxFileUpload)
            .params(createHeaderForDropboxUpload({ title, fileUrl }))
            .success(this.handleLeadDropboxUploadSuccess(leadId))
            .delay(0)
            .build();
        return dropboxUploadRequest;
    }

    handleLeadDropboxUploadSuccess = leadId => (response) => {
        // FIXME: write schema
        // FOR DATA CHANGE
        const { addLeadViewLeadChange } = this.parent.props;
        addLeadViewLeadChange({
            leadId,
            values: { attachment: { id: response.id } },
            upload: {
                title: response.title,
                url: response.file,
            },
            uiState: { pristine: false },
        });

        // FOR UPLAOD
        this.parent.setState((state) => {
            const uploadSettings = {
                [leadId]: { $auto: {
                    pending: { $set: undefined },
                } },
            };
            const leadDropboxRests = update(state.leadDropboxRests, uploadSettings);
            return { leadDropboxRests };
        });

        this.parent.dropboxUploadCoordinator.notifyComplete(leadId);
    }
}
