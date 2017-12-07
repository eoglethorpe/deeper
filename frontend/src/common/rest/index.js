export * from './docs';
export * from './file';
export * from './leadFilterOptions';
export * from './leads';
export * from './projects';
export * from './regions';
export * from './token';
export * from './userGroups';
export * from './users';
export * from './analysisFramework';


export const transformResponseErrorToFormError = (errors) => {
    const { nonFieldErrors } = errors;
    const formFieldErrors = {};

    Object.keys(errors).forEach((key) => {
        if (key !== 'nonFieldErrors') {
            formFieldErrors[key] = errors[key].join(' ');
        }
    });
    return { formFieldErrors, formErrors: nonFieldErrors };
};
