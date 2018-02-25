import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const ARY__SET_TEMPLATE = 'domain-data/ARY__SET_TEMPLATE';

// ACTION-CREATOR

export const setAryTemplateAction = ({ template }) => ({
    type: ARY__SET_TEMPLATE,
    template,
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

// REDUCER MAP

const reducers = {
    [ARY__SET_TEMPLATE]: setAryTemplate,
};

export default reducers;
