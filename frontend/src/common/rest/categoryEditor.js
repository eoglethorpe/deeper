import {
    POST,
    PATCH,
    wsEndpoint,
    PUT,
    commonHeaderForPost,
    p,
} from '../config/rest';

const cesUrlFields = ['id', 'title', 'version_id', 'created_at', 'modified_at',
    'is_admin'];

export const urlForCategoryEditors = `${wsEndpoint}/category-editors/?${p({ fields: cesUrlFields })}`;

export const urlForCeCreate = `${wsEndpoint}/category-editors/`;

export const createUrlForCeClone = categoryEditorId => (
    `${wsEndpoint}/clone-category-editor/${categoryEditorId}/`
);

export const createUrlForCategoryEditor = categoryEditorId => (
    `${wsEndpoint}/category-editors/${categoryEditorId}/`
);

export const createUrlForCeClassify = projectId => (
    `${wsEndpoint}/projects/${projectId}/category-editor/classify/`
);

export const createParamsForCeClassify = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForCeCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForCeClone = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForCeEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForCeViewPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
