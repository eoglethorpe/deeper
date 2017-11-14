/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import {
    createParamsForLeadEdit,
    createParamsForLeadCreate,
    urlForLead,
    createUrlForLeadEdit,
} from '../../common/rest';

import { RestBuilder } from '../../public/utils/rest';

const createLeadRequest = (url, params, resolve, schema) => {
    const leadCreateRequest = new RestBuilder()
        .url(url)
        .params(params)
        .decay(0.3)
        .maxRetryTime(2000)
        .maxRetryAttempts(10)
        .success((response) => {
            // TODO: Add schema validation
            console.log(response, schema);
            resolve(response);
        })
        .failure((response) => {
            console.error('Failed lead request:', response);
            resolve(response);
        })
        .fatal((response) => {
            console.error('Fatal error occured during lead request:', response);
            resolve(response);
        })
        .build();
    return leadCreateRequest;
};

export const saveLead = (lead, access) => {
    const promise = new Promise((resolve) => {
        let leadRequest;
        if (lead.serverId) {
            leadRequest = createLeadRequest(
                createUrlForLeadEdit(lead.serverId),
                () => createParamsForLeadEdit({ access }, lead.form.values),
                resolve,
            );
        } else {
            leadRequest = createLeadRequest(
                urlForLead,
                () => createParamsForLeadCreate({ access }, lead.form.values),
                resolve,
            );
        }

        leadRequest.start();
    });

    return promise;
};

export const dummy = 'dummy';
