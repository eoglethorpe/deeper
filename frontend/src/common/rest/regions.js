import { wsEndpoint, POST, DELETE, commonHeaderForPost } from '../config/rest';

export const urlForRegions = `${wsEndpoint}/regions/`;
export const urlForRegionCreate = `${wsEndpoint}/regions/`;
export const createUrlForRegion = regionId => `${wsEndpoint}/regions/${regionId}/`;

export const createParamsForRegionCreate = ({ access }, data) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

export const createParamsForCountryDelete = ({ access }) => ({
    method: DELETE,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
