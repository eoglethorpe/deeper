import {
    wsEndpoint,
    POST,
    PUT,
    commonHeaderForPost,
    p,
} from '../config/rest';

// do no use this, use urlForLead instead
export const urlForLeadCreate = `${wsEndpoint}/leads/`;
export const urlForLead = `${wsEndpoint}/leads/`;

export const createParamsForLeadCreate = ({ access }, data) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

export const createParamsFormLeadEdit = ({ access }, data) => ({
    method: PUT,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

export const createUrlForLeadsOfProject = params => (
    `${wsEndpoint}/leads/?${p(params)}`
);
