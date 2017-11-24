import {
    wsEndpoint,
    PUT,
    commonHeaderForPost,
} from '../config/rest';


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
