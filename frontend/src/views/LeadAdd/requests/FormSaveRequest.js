import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import update from '../../../vendor/react-store/utils/immutable-update';
import schema from '../../../schema';

import {
    alterResponseErrorToFaramError,

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
            this.formCoordinator.notifyComplete(leadId, true);
        }
    }

    handleLeadSaveFailure = leadId => (response) => {
        const faramErrors = alterResponseErrorToFaramError(response.errors);
        this.addLeadViewLeadChange({
            leadId,
            faramErrors,
            uiState: { pristine: true, serverError: true },
        });
        this.formCoordinator.notifyComplete(leadId, true);
    }

    handleLeadSaveFatal = leadId => () => {
        this.addLeadViewLeadChange({
            leadId,
            // FIXME: use strings
            faramErrors: { $internal: ['Error while trying to save lead.'] },
            uiState: { pristine: true, serverError: true },
        });
        this.formCoordinator.notifyComplete(leadId, true);
    }
}
