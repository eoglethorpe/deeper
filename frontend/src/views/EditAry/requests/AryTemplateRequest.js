import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForAryTemplate,
    commonParamsForGET,
} from '../../../rest';
import schema from '../../../schema';

export default class AryTemplateRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setAryTemplate, startAryRequest } = params;
        this.setAryTemplate = setAryTemplate;
        this.startAryRequest = startAryRequest;
    }

    create = (id, activeLeadId) => {
        const aryTemplateRequest = new FgRestBuilder()
            .url(createUrlForAryTemplate(id))
            .params(commonParamsForGET())
            .preLoad(() => { this.setState({ pendingAryTemplate: true }); })
            .postLoad(() => { this.setState({ pendingAryTemplate: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryTemplateGetResponse');
                    this.setAryTemplate({ template: response });
                    this.startAryRequest(activeLeadId);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return aryTemplateRequest;
    }
}
