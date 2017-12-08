import { wsEndpoint, POST, PATCH, DELETE, p, commonHeaderForPost } from '../config/rest';

export const urlForRegionCreate = `${wsEndpoint}/regions/`;
export const createUrlForRegion = regionId => `${wsEndpoint}/regions/${regionId}/`;
export const createUrlForRegionClone = regionId => `${wsEndpoint}/clone-region/${regionId}/`;

const regionsUrlFields = ['id', 'code', 'title', 'public', 'created_at', 'modified_at', 'version_id'];
export const urlForRegions = `${wsEndpoint}/regions/?${p({ fields: regionsUrlFields })}`;
export const createUrlForRegionWithField = (regionId, fields) => {
    if (fields) {
        // TODO: must check for unique fields
        const finalFields = regionsUrlFields.concat(fields);
        return `${wsEndpoint}/regions/${regionId}/?${p({ fields: finalFields })}`;
    }
    return `${wsEndpoint}/regions/${regionId}/`;
};

export const createParamsForRegionCreate = ({ access }, data) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

export const createParamsForRegionClone = ({ access }, data) => ({
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
