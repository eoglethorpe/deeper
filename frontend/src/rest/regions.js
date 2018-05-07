import {
    wsEndpoint,
    POST,
    PATCH,
    DELETE,
    p,
    commonHeaderForPost,
} from '../config/rest';

export const urlForRegionCreate = `${wsEndpoint}/regions/`;
export const urlForAdminLevels = `${wsEndpoint}/admin-levels/`;

export const createUrlForRegion = regionId => `${wsEndpoint}/regions/${regionId}/`;
export const createUrlForRegionClone = regionId => `${wsEndpoint}/clone-region/${regionId}/`;
export const createUrlForAdminLevel = adminLevelId => `${wsEndpoint}/admin-levels/${adminLevelId}/`;
export const createUrlForGeoOptions = projectId => `${wsEndpoint}/geo-options/?${p({ project: projectId })}`;

const regionsUrlFields = ['id', 'code', 'title', 'public', 'created_at', 'modified_at', 'version_id'];
export const urlForRegions = `${wsEndpoint}/regions/?${p({ fields: regionsUrlFields })}`;
export const createUrlForAdminLevelsForRegion = regionId => `${wsEndpoint}/admin-levels/?${p({ region: regionId })}`;

export const createUrlForRegionWithField = (regionId, fields) => {
    if (fields) {
        const finalFields = regionsUrlFields.concat(fields);
        return `${wsEndpoint}/regions/${regionId}/?${p({ fields: finalFields })}`;
    }
    return `${wsEndpoint}/regions/${regionId}/`;
};

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

export const createUrlForGeoAreasLoadTrigger = regionId => (
    `${wsEndpoint}/geo-areas-load-trigger/${regionId}/`
);

export const createUrlForGeoJsonMap = adminLevelId => (
    `${wsEndpoint}/admin-levels/${adminLevelId}/geojson/`
);

export const createUrlForGeoJsonBounds = adminLevelId => (
    `${wsEndpoint}/admin-levels/${adminLevelId}/geojson/bounds/`
);
