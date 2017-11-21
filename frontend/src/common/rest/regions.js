import { wsEndpoint, POST, PATCH, DELETE, commonHeaderForPost } from '../config/rest';

const regionsUrlFields = 'id,code,title,public,created_at,modified_at';
export const urlForRegions = `${wsEndpoint}/regions/?fields=${regionsUrlFields}`;
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

export const createParamsForRegionPatch = ({ access }, data) => ({
    method: PATCH,
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
