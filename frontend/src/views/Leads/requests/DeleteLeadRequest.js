import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    transformResponseErrorToFormError,
    createUrlForLeadDelete,
    createParamsForLeadDelete,
} from '../../../rest';

export default class DeleteLeadRequest {
    constructor(params) {
        const {
            setState,
            leadsStrings,
            removeLead,
        } = params;

        this.setState = setState;
        this.removeLead = removeLead;
        this.leadsStrings = leadsStrings;
    }

    create = (lead) => {
        const { id } = lead;
        const leadRequest = new FgRestBuilder()
            .url(createUrlForLeadDelete(id))
            .params(() => createParamsForLeadDelete())
            .preLoad(() => {
                this.setState({ loadingLeads: true });
            })
            .success(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.SUCCESS,
                    message: this.leadsStrings('leadDeleteSuccess'),
                    duration: notify.duration.MEDIUM,
                });

                this.removeLead({ lead });
                this.setState({ loadingLeads: false });
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: this.leadsStrings('leadDelete'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .fatal(() => {
                notify.send({
                    title: this.leadsStrings('leadDelete'),
                    type: notify.type.ERROR,
                    message: this.leadsStrings('leadDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .build();
        return leadRequest;
    }
}
