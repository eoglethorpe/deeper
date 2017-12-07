import {
    wsEndpoint,
    PUT,
    commonHeaderForPost,
    p,
} from '../config/rest';

const afsUrlFields = ['id', 'title', 'version_id', 'created_at', 'modified_at'];
export const urlForAnalysisFrameworks = `${wsEndpoint}/analysis-frameworks/?${p({ fields: afsUrlFields })}`;

export const createUrlForAnalysisFramework = analysisFrameworkId => (
    `${wsEndpoint}/analysis-frameworks/${analysisFrameworkId}/`
);

export const createParamsForAnalysisFrameworkEdit = ({ access }, data) => ({
    method: PUT,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});
