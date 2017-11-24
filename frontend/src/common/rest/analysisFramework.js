import {
    wsEndpoint,
    PATCH,
    commonHeaderForPost,
} from '../config/rest';


export const createUrlForAnalysisFramework = analysisFrameworkId => (
    `${wsEndpoint}/analysis-frameworks/${analysisFrameworkId}/`
);

export const createParamsForAnalysisFrameworkEdit = ({ access }, data) => ({
    method: PATCH,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});
