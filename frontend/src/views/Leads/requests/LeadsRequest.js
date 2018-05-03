import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import schema from '../../../schema';
import { getFiltersForRequest } from '../../../entities/lead';
import {
    createParamsForUser,
    createUrlForLeadsOfProject,
    transformResponseErrorToFormError,
} from '../../../rest';
import _ts from '../../../ts';

export default class LeadsRequest {
    constructor(params) {
        const { setState, setLeads } = params;

        this.setState = setState;
        this.setLeads = setLeads;
    }

    create = ({
        activeProject, activePage, activeSort, filters, leadsPerPage,
    }) => {
        const sanitizedFilters = getFiltersForRequest(filters);
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
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leads', 'leads'),
                    type: notify.type.ERROR,
                    message: _ts('leads', 'leadsGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return leadRequest;
    }
}
