import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    urlForArys,
    createParamsForAryCreate,
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

    create = (data) => {
        const aryPutRequest = new FgRestBuilder()
            .url(urlForArys)
            .params(createParamsForAryCreate(data))
            .preLoad(() => { this.setState({ pending: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryPostResponse');
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
