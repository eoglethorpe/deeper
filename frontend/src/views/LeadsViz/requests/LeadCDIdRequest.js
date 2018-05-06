import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import schema from '../../../schema';
import { getFiltersForRequest } from '../../../entities/lead';
import {
    createParamsForGet,
    createUrlForLeadsOfProject,
    transformResponseErrorToFormError,
} from '../../../rest';
import _ts from '../../../ts';

export default class LeadCDIdRequest {
    constructor(params) {
        const {
            stopNlpRequests,
            startNlpRequests,
            setState,
        } = params;
        this.stopNlpRequests = stopNlpRequests;
        this.startNlpRequests = startNlpRequests;
        this.setState = setState;
    }

    create = ({ activeProject, filters }) => {
        const sanitizedFilters = getFiltersForRequest(filters);

        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject.id,
            fields: 'classified_doc_id',
            ...sanitizedFilters,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({
                    loadingLeads: true,
                    hierarchicalDataPending: true,
                    chordDataPending: true,
                    correlationDataPending: true,
                    forceDirectedDataPending: true,
                    geoPointsDataPending: true,
                });
            })
            .postLoad(() => {
            })
            .success((response) => {
                try {
                    schema.validate(response, 'leadsCDIdGetResponse');
                    const docIds = response.results.reduce((acc, lead) => {
                        if (lead.classifiedDocId) {
                            acc.push(lead.classifiedDocId);
                        }
                        return acc;
                    }, []);

                    this.stopNlpRequests();
                    this.startNlpRequests(docIds);

                    this.setState({ loadingLeads: false });
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
                    title: _ts('leadsViz', 'leads'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    loadingLeads: false,
                    hierarchicalDataPending: false,
                    chordDataPending: false,
                    correlationDataPending: false,
                    forceDirectedDataPending: false,
                    geoPointsDataPending: false,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leadsViz', 'leads'),
                    type: notify.type.ERROR,
                    message: _ts('leadsViz', 'leadsGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    loadingLeads: false,
                    hierarchicalDataPending: false,
                    chordDataPending: false,
                    correlationDataPending: false,
                    forceDirectedDataPending: false,
                    geoPointsDataPending: false,
                });
            })
            .build();
        return leadRequest;
    }
}
