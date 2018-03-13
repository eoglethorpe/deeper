import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const ARY__SET_TEMPLATE = 'domain-data/ARY__SET_TEMPLATE';
export const ARY__SET_ARY_FILTER_OPTIONS = 'domain-data/ARY__SET_ARY_FILTER_OPTIONS';

// ACTION-CREATOR

export const setAryTemplateAction = ({ template }) => ({
    type: ARY__SET_TEMPLATE,
    template,
});

export const setAryFilterOptionsAction = ({ projectId, aryFilterOptions }) => ({
    type: ARY__SET_ARY_FILTER_OPTIONS,
    projectId,
    aryFilterOptions,
});

// HELPERS

// REDUCER

const setAryTemplate = (state, action) => {
    const { template } = action;
    const settings = {
        aryTemplates: {
            [template.id]: { $auto: {
                $set: template,
            } },
        },
    };
    return update(state, settings);
};

const setAryFilterOptions = (state, action) => {
    const { projectId, aryFilterOptions } = action;
    const settings = {
        aryFilterOptions: {
            [projectId]: { $auto: {
                $set: aryFilterOptions,
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [ARY__SET_TEMPLATE]: setAryTemplate,
    [ARY__SET_ARY_FILTER_OPTIONS]: setAryFilterOptions,
};

export default reducers;
