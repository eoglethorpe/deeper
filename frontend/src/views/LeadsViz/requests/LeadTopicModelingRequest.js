import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import notify from '../../../notify';
import {
    // urlForLeadTopicModeling,
    createUrlForLeadTopicModeling,
    createParamsForLeadTopicModeling,
} from '../../../rest';

export default class LeadTopicModelingRequest {
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
            // .url(urlForLeadTopicModeling)
            .url(createUrlForLeadTopicModeling(activeProject, isFilter))
            .params(createParamsForLeadTopicModeling({
                doc_ids: docIds,
                number_of_topics: 5,
                depth: 2,
                keywords_per_topic: 3,
            }))
            .preLoad(() => {
                this.setState({ hierarchicalDataPending: true });
            })
            .postLoad(() => {
                this.setState({ hierarchicalDataPending: false });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.setLeadVisualization({
                        hierarchial: response,
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
                    message: 'Failed to load Hierarchical Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Hierarchical Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }
}
