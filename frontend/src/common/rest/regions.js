import { wsEndpoint, POST, commonHeaderForPost } from '../config/rest';

export const urlForRegions = `${wsEndpoint}/regions/`;
export const urlForRegionCreate = `${wsEndpoint}/regions/`;
export const createParamsForRegionCreate = ({ access }, data) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

