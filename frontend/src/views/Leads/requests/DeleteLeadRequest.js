import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    transformResponseErrorToFormError,
    createUrlForLeadDelete,
    createParamsForLeadDelete,
} from '../../../rest';
import _ts from '../../../ts';

export default class DeleteLeadRequest {
    constructor(params) {
        const {
            setState,
            removeLead,
        } = params;

        this.setState = setState;
        this.removeLead = removeLead;
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
                    title: _ts('leads', 'leadDelete'),
                    type: notify.type.SUCCESS,
                    message: _ts('leads', 'leadDeleteSuccess'),
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
                    title: _ts('leads', 'leadDelete'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leads', 'leadDelete'),
                    type: notify.type.ERROR,
                    message: _ts('leads', 'leadDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({ loadingLeads: false });
            })
            .build();
        return leadRequest;
    }
}
