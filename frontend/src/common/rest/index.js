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
    const { nonFieldErrors: formErrors, ...formFieldErrorList } = errors;

    const formFieldErrors = Object.keys(formFieldErrorList).reduce(
        (acc, key) => {
            acc[key] = formFieldErrorList[key].join(' ');
            return acc;
        },
        {},
    );
    return { formFieldErrors, formErrors };
};
