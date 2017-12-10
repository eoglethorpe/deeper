import {
    POST,
    wsEndpoint,
    PUT,
    commonHeaderForPost,
    p,
} from '../config/rest';

const afsUrlFields = ['id', 'title', 'version_id', 'created_at', 'modified_at',
    'is_admin', 'description', 'snapshot_one', 'snapshot_two'];

export const urlForAnalysisFrameworks = `${wsEndpoint}/analysis-frameworks/?${p({ fields: afsUrlFields })}`;

export const urlForAfCreate = `${wsEndpoint}/analysis-frameworks/`;

export const createUrlForAfClone = analysisFrameworkId => (
    `${wsEndpoint}/clone-analysis-framework/${analysisFrameworkId}/`
);

export const createUrlForAnalysisFramework = analysisFrameworkId => (
    `${wsEndpoint}/analysis-frameworks/${analysisFrameworkId}/`
);

export const createParamsForAfCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAfClone = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAnalysisFrameworkEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});
