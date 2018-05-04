import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    createUrlForLeadEdit,
    createParamsForLeadPatch,
    transformResponseErrorToFormError,
} from '../../../rest';
import _ts from '../../../ts';

export default class PatchLeadRequest {
    constructor(params) {
        const {
            setState,
            patchLead,
        } = params;

        this.setState = setState;
        this.patchLead = patchLead;
    }

    create = (lead, values) => {
        const { id } = lead;

        const leadRequest = new FgRestBuilder()
            .url(createUrlForLeadEdit(id))
            .params(() => createParamsForLeadPatch(values))
            .preLoad(() => {
                this.setState({ loadingLeads: true });
            })
            .success((response) => {
                notify.send({
                    title: _ts('leads', 'leads'),
                    type: notify.type.SUCCESS,
                    message: _ts('leads', 'leadsPatchSuccess'),
                    duration: notify.duration.MEDIUM,
                });

                this.patchLead({ lead: response });
                this.setState({ loadingLeads: false });
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('leads', 'leads'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leads', 'leads'),
                    type: notify.type.ERROR,
                    message: _ts('leads', 'leadsPatchFailure'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .build();
        return leadRequest;
    }
}
