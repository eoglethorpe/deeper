import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import schema from '../../../schema';
import Leads from '../../Leads';
import {
    createParamsForUser,
    createUrlForLeadsOfProject,
    transformResponseErrorToFormError,
} from '../../../rest';

export default class LeadsRequest {
    constructor(params) {
        const { setState, setLeads } = params;

        this.setState = setState;
        this.setLeads = setLeads;
    }

    create = ({
        activeProject, activePage, activeSort, filters, leadsPerPage,
    }) => {
        const sanitizedFilters = Leads.getFiltersForRequest(filters);
        const leadRequestOffset = (activePage - 1) * leadsPerPage;
        const leadRequestLimit = leadsPerPage;

        // TODO: VAGUE add required fields only
        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            ordering: activeSort,
            ...sanitizedFilters,
            offset: leadRequestOffset,
            limit: leadRequestLimit,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({ loadingLeads: true });
            })
            .postLoad(() => {
                this.setState({ loadingLeads: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'leadsGetResponse');
                    this.setLeads({
                        leads: response.results,
                        totalLeadsCount: response.count,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const { formErrors: { errors = [] } } =
                    transformResponseErrorToFormError(response.errors);
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: errors.join(''),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load leads', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return leadRequest;
    }
}
