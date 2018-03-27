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

import { leadAccessor } from '../../../entities/lead';

export default class FormSaveRequest {
    constructor(params) {
        const {
            formCoordinator,
            addLeadViewLeadChange,
            addLeadViewLeadSave,
            getLeadFromId,
            setState,
        } = params;
        this.formCoordinator = formCoordinator;
        this.addLeadViewLeadSave = addLeadViewLeadSave;
        this.addLeadViewLeadChange = addLeadViewLeadChange;
        this.getLeadFromId = getLeadFromId;
        this.setState = setState;
    }

    create = (lead, newValues) => {
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
            this.addLeadViewLeadSave({
                leadId,
                serverId: response.id,
            });
            this.formCoordinator.notifyComplete(leadId);
        } catch (err) {
            console.warn(err);
            this.formCoordinator.notifyComplete(leadId, true);
        }
    }

    handleLeadSaveFailure = leadId => (response) => {
        const {
            formFieldErrors,
            formErrors,
        } = transformResponseErrorToFormError(response.errors);

        this.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
            uiState: { pristine: true, serverError: true },
        });
        this.formCoordinator.notifyComplete(leadId, true);
    }

    handleLeadSaveFatal = leadId => () => {
        this.addLeadViewLeadChange({
            leadId,
            // FIXME: use strings
            formErrors: { errors: ['Error while trying to save lead.'] },
            uiState: { pristine: true, serverError: true },
        });
        this.formCoordinator.notifyComplete(leadId, true);
    }
}
