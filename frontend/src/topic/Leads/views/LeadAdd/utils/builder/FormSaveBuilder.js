import { FgRestBuilder } from '../../../../../../public/utils/rest';
import update from '../../../../../../public/utils/immutable-update';

import {
    transformResponseErrorToFormError,

    urlForLead,
    createUrlForLeadEdit,
    createParamsForLeadEdit,
    createParamsForLeadCreate,
} from '../../../../../../common/rest';


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
        this.parent.props.addLeadViewLeadSave({
            leadId,
            serverId: response.id,
        });
        this.parent.formCoordinator.notifyComplete(leadId);
    }
    handleLeadSaveFailure = leadId => (response) => {
        // console.error('Failed lead request:', response);
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
    handleLeadSaveFatal = leadId => (response) => {
        console.info('FATAL:', response);

        this.parent.props.addLeadViewLeadChange({
            leadId,
            formErrors: ['Error while trying to save lead.'],
            uiState: { pristine: true },
        });
        this.parent.formCoordinator.notifyComplete(leadId);
    }
}
