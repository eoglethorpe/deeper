import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    createUrlForLeadTopicCorrelation,
    createParamsForLeadTopicCorrelation,
} from '../../../rest';
import _ts from '../../../ts';

export default class LeadTopicCorrelationRequest {
    constructor(params) {
        const {
            setLeadVisualization,
            setState,
        } = params;
        this.setLeadVisualization = setLeadVisualization;
        this.setState = setState;
    }

    create = ({ docIds, activeProject, isFilter }) => {
        const request = new FgRestBuilder()
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
                    title: _ts('leadsViz', 'topicCorrelation'),
                    type: notify.type.ERROR,
                    message: _ts('leadsViz', 'topicCorrelationGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('leadsViz', 'topicCorrelation'),
                    type: notify.type.ERROR,
                    message: _ts('leadsViz', 'topicCorrelationGetFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }
}
