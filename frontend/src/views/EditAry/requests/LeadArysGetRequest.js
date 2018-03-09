import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import schema from '../../../schema';
import Leads from '../../Leads';
import {
    createUrlForArysOfProject,
    commonParamsForGET,
    transformResponseErrorToFormError,
} from '../../../rest';

export default class LeadArysGetRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setArys } = params;
        this.setArys = setArys;
    }

    create = (leadId) => {
        const sanitizedFilters = Leads.getFiltersForRequest({ lead: leadId });
        console.warn(sanitizedFilters);

        // TODO: VAGUE add required fields only
        const urlForProjectArys = createUrlForArysOfProject({
            ...sanitizedFilters,
        });

        const arysRequest = new FgRestBuilder()
            .url(urlForProjectArys)
            .params(() => commonParamsForGET())
            .preLoad(() => {
                this.setState({ arysPending: true });
            })
            .postLoad(() => {
                this.setState({ arysPending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'arysGetResponse');
                    this.setArys({
                        arys: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Assessment Registry', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Assessment Registry', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load Assessments', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return arysRequest;
    }
}
