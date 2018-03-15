import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createParamsForUser,
    createUrlForAnalysisFramework,
} from '../../../rest';
import schema from '../../../schema';

export default class AfRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const {
            api,
            getAf,
            removeAllEntries,
            setAnalysisFramework,
            startEntriesRequest,
        } = params;
        this.api = api;
        this.getAf = getAf;
        this.removeAllEntries = removeAllEntries;
        this.setAnalysisFramework = setAnalysisFramework;
        this.startEntriesRequest = startEntriesRequest;
    }

    create = (analysisFrameworkId, leadId) => {
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(createUrlForAnalysisFramework(analysisFrameworkId))
            .params(() => createParamsForUser())
            .delay(0)
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');

                    // TODO: notify that analysis framework changed and history was removed
                    const analysisFramework = this.getAf();
                    if (analysisFramework.versionId < response.versionId) {
                        this.removeAllEntries({ leadId });
                    }
                    this.setAnalysisFramework({ analysisFramework: response });
                    this.setState({ pendingAf: false });

                    this.startEntriesRequest(leadId);
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error(response);
            })
            .fatal(() => {
                this.setState({ pendingAf: false, pendingEntries: false });
                // TODO: notify
                console.error('Failed loading af of lead');
            })
            .build();
        return analysisFrameworkRequest;
    }
}
