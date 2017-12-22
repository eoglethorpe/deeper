import {
    POST,
    commonHeaderForPostExternal,
} from '../config/rest';

export const urlForCategoryEditor = 'https://deepl.togglecorp.com/api/keywords-extraction/';

export const createParamsForCategoryEditor = document => ({
    method: POST,
    headers: commonHeaderForPostExternal,
    body: JSON.stringify({
        document,
    }),
});
