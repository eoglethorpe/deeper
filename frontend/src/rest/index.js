import { GET, commonHeaderForGet } from '../config/rest';

export * from './docs';
export * from './file';
export * from './leadFilterOptions';
export * from './entryFilterOptions';
export * from './leads';
export * from './entries';
export * from './external';
export * from './projects';
export * from './connectors';
export * from './regions';
export * from './token';
export * from './userGroups';
export * from './users';
export * from './analysisFramework';
export * from './assessmentRegistry';
export * from './categoryEditor';
export * from './export';

export const createParamsForGet = () => ({
    method: GET,
    headers: commonHeaderForGet,
});

export const transformResponseErrorToFormError = (errors) => {
    const { nonFieldErrors = [], ...formFieldErrorList } = errors;

    const formErrors = {
        errors: nonFieldErrors,
    };
    const formFieldErrors = Object.keys(formFieldErrorList).reduce(
        (acc, key) => {
            acc[key] = formFieldErrorList[key].join(' ');
            return acc;
        },
        {},
    );
    return { formFieldErrors, formErrors };
};

export const transformAndCombineResponseErrors = (errors) => {
    const transformedErrors = transformResponseErrorToFormError(errors);
    return [
        ...transformedErrors.formErrors.errors,
        ...Object.values(transformedErrors.formFieldErrors),
    ];
};


// XXX: Uses Faram API
export const alterResponseErrorToFaramError = (errors) => {
    const { nonFieldErrors = [], ...formFieldErrorList } = errors;

    return Object.keys(formFieldErrorList).reduce(
        (acc, key) => {
            acc[key] = formFieldErrorList[key].join(' ');
            return acc;
        },
        {
            $internal: nonFieldErrors,
        },
    );
};

// XXX: Uses Faram API
export const alterAndCombineResponseError = errors => (
    Object.values(alterResponseErrorToFaramError(errors))
);
