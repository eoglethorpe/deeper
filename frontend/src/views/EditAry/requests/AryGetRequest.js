import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLeadAry,
    commonParamsForGET,
} from '../../../rest';
import schema from '../../../schema';

export default class AryGetRequest {
    static dataType = {
        metaData: 'meta_data',
        methodologyData: 'methodology_data',
    }

    constructor(parent, params) {
        this.setState = (state) => {
            parent.setState(state);
        };

        const { setAry, dataType } = params;
        this.setAry = setAry;
        this.dataType = dataType;
    }

    create = (id) => { // id is lead id
        const aryPutRequest = new FgRestBuilder()
            .url(createUrlForLeadAry(id, [this.dataType]))
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
