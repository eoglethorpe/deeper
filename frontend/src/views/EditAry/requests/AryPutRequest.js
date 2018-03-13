import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLeadAry,
    createParamsForAryEdit,
} from '../../../rest';
import schema from '../../../schema';

export default class AryPutRequest {
    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setAry } = params;
        this.setAry = setAry;
    }

    create = (id, data) => {
        const aryPutRequest = new FgRestBuilder()
            .url(createUrlForLeadAry(id))
            .params(createParamsForAryEdit(data))
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryPutResponse');
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
