import { POST } from '../config/rest';

export const urlForLeadClassify =
    'http://deepl.togglecorp.com/api/v2/classify/';

export const dummy = leadDocId =>
    `http://deepl.togglecorp.com/api/v2/classify/${leadDocId}`;

export const createParamsForLeadClassify = body => ({
    method: POST,
    body: JSON.stringify(body),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});
