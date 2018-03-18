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

        const { setAryTemplate } = params;
        this.setAryTemplate = setAryTemplate;
    }

    create = (id) => {
        const aryTemplateRequest = new FgRestBuilder()
            .url(createUrlForAryTemplate(id))
            .params(commonParamsForGET())
            .preLoad(() => { this.setState({ pendingAryTemplate: true }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryTemplateGetResponse');
                    this.setAryTemplate({ template: response });
                    this.setState({ pendingAryTemplate: false });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                this.setState({ pendingAryTemplate: false });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({ pendingAryTemplate: false });
            })
            .build();
        return aryTemplateRequest;
    }
}
