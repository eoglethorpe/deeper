import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLeadAry,
    commonParamsForGET,
} from '../../../rest';
import schema from '../../../schema';

export default class AryGetRequest {
    constructor(params) {
        const {
            setAry,
            setState,
        } = params;
        this.setAry = setAry;
        this.setState = setState;
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
                    this.setAry({
                        serverId: response.id,
                        lead: response.lead,
                        versionId: response.versionId,
                        metadata: response.metadata,
                        methodology: response.methodology,
                    });
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
