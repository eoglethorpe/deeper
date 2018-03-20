import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    // urlForLeadTopicCorrelation,
    createUrlForLeadTopicCorrelation,
    createParamsForLeadTopicCorrelation,
} from '../../../rest';

export default class LeadTopicCorrelationRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setLeadVisualization } = params;
        this.setLeadVisualization = setLeadVisualization;
    }

    create = ({ docIds, activeProject, isFilter }) => {
        const request = new FgRestBuilder()
            // .url(urlForLeadTopicCorrelation)
            .url(createUrlForLeadTopicCorrelation(activeProject, isFilter))
            .params(createParamsForLeadTopicCorrelation({
                doc_ids: docIds,
            }))
            .preLoad(() => {
                this.setState({
                    correlationDataPending: true,
                    chordDataPending: true,
                    forceDirectedDataPending: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    correlationDataPending: false,
                    chordDataPending: false,
                    forceDirectedDataPending: false,
                });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.setLeadVisualization({
                        correlation: response,
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
                    message: 'Failed to load Topic Correlation Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Topic Correlation Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }
}