import {
    DELETE,
    GET,
    POST,
    PUT,
    commonHeaderForPost,
    p,
    wsEndpoint,
} from '../config/rest';


const aryUrlFields = ['id', 'title', 'version_id', 'lead', 'created_at', 'modified_at'];

export const urlForAryTemplates = `${wsEndpoint}/assessment-templates/`;
export const urlForArys = `${wsEndpoint}/assessments/`;

export const createUrlForAryTemplate = id => `${wsEndpoint}/assessment-templates/${id}/`;
export const createUrlForAry = id => `${wsEndpoint}/assessments/${id}/`;
export const createUrlForLeadAry = (id, fields) => { // id is lead Id
    if (fields) {
        return `${wsEndpoint}/lead-assessments/${id}/?${p({ fields: aryUrlFields.concat(fields) })}`;
    }
    return `${wsEndpoint}/lead-assessments/${id}/`;
};

export const createUrlForAryDelete = createUrlForAry;

export const createUrlForArysOfProject = params => (
    `${urlForArys}?${p(params)}`
);

export const createUrlForAryFilterOptions = projectId => (
    `${wsEndpoint}/assessment-options/?${p({ project: projectId })}`
);

export const commonParamsForGET = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

/* Ary fields: lead*, metaData, methodologyData  */
export const createParamsForAryCreate = data => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAryEdit = data => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForAryDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});
