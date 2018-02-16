import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import schema from '../../../schema';

import {
    transformResponseErrorToFormError,

    urlForLead,
    createUrlForLeadEdit,
    createParamsForLeadEdit,
    createParamsForLeadCreate,
} from '../../../rest';
import notify from '../../../notify';

import {
    leadAccessor,
} from '../../../entities/lead';

export default class FormSaveBuilder {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            formCoordinator,
            notificationStrings,
            addLeadViewLeadChange,
            addLeadViewLeadSave,
        } = params;
        this.formCoordinator = formCoordinator;
        this.notificationStrings = notificationStrings;
        this.addLeadViewLeadSave = addLeadViewLeadSave;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
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
        this.setState((state) => {
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
        this.setState((state) => {
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
            schema.validate(response, 'lead');

            notify.send({
                title: this.notificationStrings('leadSave'),
                type: notify.type.SUCCESS,
                message: this.notificationStrings('leadSaveSuccess'),
                duration: notify.duration.MEDIUM,
            });
            this.addLeadViewLeadSave({
                leadId,
                serverId: response.id,
            });
            this.formCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.warn(err);
        }
    }
    handleLeadSaveFailure = leadId => (response) => {
        // console.error('Failed lead request:', response);
        notify.send({
            title: this.notificationStrings('leadSave'),
            type: notify.type.ERROR,
            message: this.notificationStrings('leadSaveFailure'),
            duration: notify.duration.SLOW,
        });
        const {
            formFieldErrors,
            formErrors,
        } = transformResponseErrorToFormError(response.errors);

        this.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { pristine: true },
        });
        this.formCoordinator.notifyComplete(leadId);
    }
    handleLeadSaveFatal = leadId => () => {
        notify.send({
            title: this.notificationStrings('leadSave'),
            type: notify.type.ERROR,
            message: this.notificationStrings('leadSaveFatal'),
            duration: notify.duration.SLOW,
        });

        this.addLeadViewLeadChange({
            leadId,
            // FIXME: use strings
            formErrors: ['Error while trying to save lead.'],
            uiState: { pristine: true },
        });
        this.formCoordinator.notifyComplete(leadId);
    }
}
