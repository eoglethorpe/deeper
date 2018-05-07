import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import { checkVersion } from '../../../vendor/react-store/utils/common';
import {
    createUrlForLeadAry,
    createParamsForGet,
} from '../../../rest';
import notify from '../../../notify';
import schema from '../../../schema';

export default class AryGetRequest {
    constructor(params) {
        const {
            setAry,
            setState,
            getAryVersionId,
        } = params;
        this.setAry = setAry;
        this.setState = setState;
        this.getAryVersionId = getAryVersionId;
    }

    create = (id) => { // id is lead id
        const aryPutRequest = new FgRestBuilder()
            .url(createUrlForLeadAry(id))
            .params(createParamsForGet)
            .preLoad(() => { this.setState({ pendingAry: true }); })
            .postLoad(() => { this.setState({ pendingAry: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'aryGetResponse');
                    const oldVersionId = this.getAryVersionId();

                    const {
                        shouldSetValue,
                        isValueOverriden,
                    } = checkVersion(oldVersionId, response.versionId);

                    if (shouldSetValue) {
                        this.setAry({
                            serverId: response.id,
                            lead: response.lead,
                            versionId: response.versionId,
                            metadata: response.metadata,
                            methodology: response.methodology,
                            summary: response.summary,
                            score: response.score,
                        });
                    }
                    if (isValueOverriden) {
                        // FIXME: use strings
                        notify.send({
                            type: notify.type.WARNING,
                            title: 'Assessment',
                            message: 'Your copy was overridden by server\'s copy.',
                            duration: notify.duration.SLOW,
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                // FIXME: use notify
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                // FIXME: use notify
                console.info('FATAL:', response);
            })
            .build();
        return aryPutRequest;
    }
}
