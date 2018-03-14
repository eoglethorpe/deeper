import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import schema from '../../../schema';
import {
    // urlForLeadKeywordCorrelation,
    createUrlForLeadKeywordCorrelation,
    createParamsForLeadKeywordCorrelation,
} from '../../../rest';

export default class LeadKeywordCorrelationRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setLeadVisualization } = params;
        this.setLeadVisualization = setLeadVisualization;
    }

    create = ({ docIds, activeProject, isFilter }) => {
        const request = new FgRestBuilder()
            // .url(urlForLeadNerDocsId(activeProject))
            .url(createUrlForLeadKeywordCorrelation(activeProject, isFilter))
            .params(createParamsForLeadKeywordCorrelation({
                doc_ids: docIds,
            }))
            .preLoad(() => {
                this.setState({ keywordCorrelationDataPending: true });
            })
            .postLoad(() => {
                this.setState({ keywordCorrelationDataPending: false });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    schema.validate(response, 'leadKeywordCorrelationResponse');
                    this.setLeadVisualization({
                        keywordCorrelation: response,
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
                    // FIXME: strings
                    message: 'Failed to load Keyword Correlation Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    // FIXME: strings
                    message: 'Failed to load Keyword Correlation Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }
}
