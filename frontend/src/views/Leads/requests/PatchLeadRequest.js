import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    createUrlForLeadEdit,
    createParamsForLeadPatch,
    transformResponseErrorToFormError,
} from '../../../rest';

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
                    title: 'Leads', // FIXME: strings
                    type: notify.type.SUCCESS,
                    message: 'Lead changed successfully.',
                    duration: notify.duration.MEDIUM,
                });

                this.patchLead({ lead: response });
                this.setState({ loadingLeads: false });
            })
            .failure((response) => {
                console.warn(response);
                const { formErrors: { errors = [] } } =
                    transformResponseErrorToFormError(response.errors);
                notify.send({
                    title: 'Leads',
                    type: notify.type.ERROR,
                    message: errors.join(''),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads',
                    type: notify.type.ERROR,
                    message: 'Lead couldn\'t be changed.',
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .build();
        return leadRequest;
    }
}
