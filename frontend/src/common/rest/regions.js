import { wsEndpoint, GET, POST, PATCH, DELETE, p, commonHeaderForPost } from '../config/rest';

export const urlForRegionCreate = `${wsEndpoint}/regions/`;
export const urlForAdminLevels = `${wsEndpoint}/admin-levels/`;

export const createUrlForRegion = regionId => `${wsEndpoint}/regions/${regionId}/`;
export const createUrlForRegionClone = regionId => `${wsEndpoint}/clone-region/${regionId}/`;
export const createUrlForAdminLevel = adminLevelId => `${wsEndpoint}/admin-levels/${adminLevelId}/`;

const regionsUrlFields = ['id', 'code', 'title', 'public', 'created_at', 'modified_at', 'version_id'];
export const urlForRegions = `${wsEndpoint}/regions/?${p({ fields: regionsUrlFields })}`;
export const createUrlForAdminLevelsForRegion = regionId => `${wsEndpoint}/admin-levels/?region=${regionId}`;

export const createUrlForRegionWithField = (regionId, fields) => {
    if (fields) {
        // TODO: must check for unique fields
        const finalFields = regionsUrlFields.concat(fields);
        return `${wsEndpoint}/regions/${regionId}/?${p({ fields: finalFields })}`;
    }
    return `${wsEndpoint}/regions/${regionId}/`;
};

export const createParamsForAdminLevelsForRegionGET = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

export const createParamsForAdminLevelsForRegionPOST = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAdminLevelsForRegionPATCH = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAdminLevelDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForRegionCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForRegionClone = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForRegionPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForCountryDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});
