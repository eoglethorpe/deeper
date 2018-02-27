import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForAry,
    commonParamsForGET,
} from '../../../rest';
import schema from '../../../schema';

export default class AryPostRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setAry } = params;
        this.setAry = setAry;
    }

    create = (id) => {
        const aryPutRequest = new FgRestBuilder()
            .url(createUrlForAry(id))
            .params(commonParamsForGET())
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryGetResponse');
                    this.setAry(response);
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
        return aryPutRequest;
    }
}
