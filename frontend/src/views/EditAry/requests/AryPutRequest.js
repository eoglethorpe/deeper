import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlForLeadAry,
    createParamsForAryEdit,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';

export default class AryPutRequest {
    constructor(params) {
        const {
            setAry,
            setState,
        } = params;
        this.setAry = setAry;
        this.setState = setState;
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
                    this.setAry({
                        lead: response.lead,
                        serverId: response.id,
                        versionId: response.versionId,
                        metadata: response.metadata,
                        methodology: response.methodology,
                        summary: response.summary,
                    });

                    // FIXME: use strings
                    notify.send({
                        type: notify.type.SUCCESS,
                        title: 'Assessment',
                        message: 'Assessment save successful.',
                        duration: notify.duration.MEDIUM,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                // FIXME: notify
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                // FIXME: notify
                console.info('FATAL:', response);
            })
            .build();
        return aryPutRequest;
    }
}
