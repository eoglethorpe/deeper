import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import schema from '../../../schema';
import Leads from '../../Leads';
import {
    createUrlForArysOfProject,
    commonParamsForGET,
    transformResponseErrorToFormError,
} from '../../../rest';

export default class ArysGetRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setArys } = params;
        this.setArys = setArys;
    }

    create = ({
        activeProject, activePage, activeSort, filters, MAX_ARYS_PER_REQUEST,
    }) => {
        const sanitizedFilters = Leads.getFiltersForRequest(filters);
        const aryRequestOffset = (activePage - 1) * MAX_ARYS_PER_REQUEST;
        const aryRequestLimit = MAX_ARYS_PER_REQUEST;

        // TODO: VAGUE add required fields only
        const urlForProjectArys = createUrlForArysOfProject({
            project: activeProject,
            ordering: activeSort,
            ...sanitizedFilters,
            offset: aryRequestOffset,
            limit: aryRequestLimit,
        });

        const arysRequest = new FgRestBuilder()
            .url(urlForProjectArys)
            .params(() => commonParamsForGET())
            .preLoad(() => {
                this.setState({ loadingArys: true });
            })
            .postLoad(() => {
                this.setState({ loadingArys: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'arysGetResponse');
                    this.setArys({
                        projectId: activeProject,
                        arys: response.results,
                        totalArysCount: response.count,
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
