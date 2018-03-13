import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    // urlForLeadNerDocsId,
    createUrlForLeadNerDocsId,
    createParamsForLeadNer,
} from '../../../rest';

export default class LeadNerRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setLeadVisualization } = params;
        this.setLeadVisualization = setLeadVisualization;
    }

    create = ({ docIds, activeProject, isFilter }) => {
        const request = new FgRestBuilder()
            // .url(urlForLeadNerDocsId)
            .url(createUrlForLeadNerDocsId(activeProject, isFilter))
            .params(createParamsForLeadNer({
                doc_ids: docIds,
            }))
            .preLoad(() => {
                this.setState({
                    geoPointsDataPending: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    geoPointsDataPending: false,
                });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.setLeadVisualization({
                        geoPoints: response.locations,
                        projectId: activeProject.id,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Geo Points Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Geo Points Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }
}
