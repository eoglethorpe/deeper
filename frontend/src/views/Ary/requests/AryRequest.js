import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForAryTemplate,
    commonParamsForGET,
} from '../../../rest';
import schema from '../../../schema';

export default class AryRequest {
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
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryTemplateGetResponse');
                    this.setAryTemplate({ template: response });
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