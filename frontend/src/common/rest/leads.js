import { wsEndpoint, POST, commonHeaderForPost, p } from './index';

export const urlForLeadCreate = `${wsEndpoint}/leads/`;
export const createParamsForLeadCreate = ({ access }, data) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

export const createUrlForLeadsOfProject = params => (
    `${wsEndpoint}/leads/?${p(params)}`
);
