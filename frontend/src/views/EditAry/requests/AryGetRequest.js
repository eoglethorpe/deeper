import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLeadAry,
    commonParamsForGET,
} from '../../../rest';
import schema from '../../../schema';

export default class AryGetRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setAry } = params;
        this.setAry = setAry;
    }

    create = (id) => { // id is lead id
        // FIXME: add overwrite confirmation
        const aryPutRequest = new FgRestBuilder()
            .url(createUrlForLeadAry(id))
            .params(commonParamsForGET())
            .preLoad(() => { this.setState({ pendingAry: true }); })
            .postLoad(() => { this.setState({ pendingAry: false }); })
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
