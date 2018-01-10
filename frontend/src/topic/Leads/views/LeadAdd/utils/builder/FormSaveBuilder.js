import { FgRestBuilder } from '../../../../../../public/utils/rest';
import update from '../../../../../../public/utils/immutable-update';
import schema from '../../../../../../common/schema';

import {
    transformResponseErrorToFormError,

    urlForLead,
    createUrlForLeadEdit,
    createParamsForLeadEdit,
    createParamsForLeadCreate,
} from '../../../../../../common/rest';
import {
    notificationStrings,
} from '../../../../../../common/constants';
import notify from '../../../../../../common/notify';

import {
    leadAccessor,
} from '../../../../../../common/entities/lead';

export default class FormSaveBuilder {
    constructor(parent) {
        this.parent = parent;
    }

    createRequest = (lead, newValues) => {
        const serverId = leadAccessor.getServerId(lead);
        const leadId = leadAccessor.getKey(lead);

        let url;
        let params;
        if (serverId) {
            url = createUrlForLeadEdit(serverId);
            params = () => createParamsForLeadEdit(newValues);
        } else {
            url = urlForLead;
            params = () => createParamsForLeadCreate(newValues);
        }

        const leadCreateRequest = new FgRestBuilder()
            .url(url)
            .delay(0)
            .params(params)
            .preLoad(this.handleLeadSavePreLoad(leadId))
            .postLoad(this.handleLeadSavePostLoad(leadId))
            .success(this.handleLeadSaveSuccess(leadId))
            .failure(this.handleLeadSaveFailure(leadId))
            .fatal(this.handleLeadSaveFatal(leadId))
            .build();
        return leadCreateRequest;
    }

    handleLeadSavePreLoad = leadId => () => {
        // FOR REST
        this.parent.setState((state) => {
            const restSettings = {
                [leadId]: { $auto: {
                    pending: { $set: true },
                } },
            };
            const leadRests = update(state.leadRests, restSettings);
            return { leadRests };
        });
    }
    handleLeadSavePostLoad = leadId => () => {
        // FOR REST
        this.parent.setState((state) => {
            const restSettings = {
                [leadId]: { $auto: {
                    pending: { $set: false },
                } },
            };
            const leadRests = update(state.leadRests, restSettings);
            return { leadRests };
        });
    }
    handleLeadSaveSuccess = leadId => (response) => {
        try {
            schema.validate(response, 'galleryFile');

            notify.send({
                title: notificationStrings.leadSave,
                type: notify.type.SUCCESS,
                message: notificationStrings.leadSaveSuccess,
                duration: notify.duration.MEDIUM,
            });
            this.parent.props.addLeadViewLeadSave({
                leadId,
                serverId: response.id,
            });
            this.parent.formCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.warn(err);
        }
    }
    handleLeadSaveFailure = leadId => (response) => {
        // console.error('Failed lead request:', response);
        notify.send({
            title: notificationStrings.leadSave,
            type: notify.type.ERROR,
            message: notificationStrings.leadSaveFailure,
            duration: notify.duration.SLOW,
        });
        const {
            formFieldErrors,
            formErrors,
        } = transformResponseErrorToFormError(response.errors);

        this.parent.props.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { pristine: true },
        });
        this.parent.formCoordinator.notifyComplete(leadId);
    }
    handleLeadSaveFatal = leadId => () => {
        notify.send({
            title: notificationStrings.leadSave,
            type: notify.type.ERROR,
            message: notificationStrings.leadSaveFatal,
            duration: notify.duration.SLOW,
        });

        this.parent.props.addLeadViewLeadChange({
            leadId,
            formErrors: ['Error while trying to save lead.'],
            uiState: { pristine: true },
        });
        this.parent.formCoordinator.notifyComplete(leadId);
    }
}
