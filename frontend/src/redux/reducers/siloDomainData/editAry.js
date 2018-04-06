import {
    analyzeFieldErrors,
    analyzeFormErrors,
} from '../../../vendor/react-store/components/Input/Form/validator';
import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const EDIT_ARY__SET_ARY = 'siloDomainData/EDIT_ARY__SET_ARY';
export const EDIT_ARY__CHANGE_METHODOLOGY_ARY = 'siloDomainData/EDIT_ARY__CHANGE_METHODOLOGY_ARY';
export const EDIT_ARY__CHANGE_METADATA_ARY = 'siloDomainData/EDIT_ARY__CHANGE_METADATA_ARY';
export const EDIT_ARY__SAVE_ARY = 'siloDomainData/EDIT_ARY__SAVE_ARY';
export const EDIT_ARY__SET_ERROR_ARY = 'siloDomainData/EDIT_ARY__SET_ERROR_ARY';

// ACTION-CREATOR

export const setErrorAryForEditAryAction = ({
    lead, formErrors, fieldErrors,
}) => ({
    type: EDIT_ARY__SET_ERROR_ARY,
    lead,
    formErrors,
    fieldErrors,
});

export const setAryForEditAryAction = ({
    lead, serverId, versionId, metadata, methodology,
}) => ({
    type: EDIT_ARY__SET_ARY,
    lead,
    serverId,
    versionId,
    metadata,
    methodology,
});

export const saveAryForEditAryAction = ({ lead }) => ({
    type: EDIT_ARY__SAVE_ARY,
    lead,
});

const changeAryAction = type => ({
    formValues, formErrors, fieldErrors, lead,
}) => ({
    type,
    lead,
    formValues,
    formErrors,
    fieldErrors,
});

export const changeAryMetadataForEditAryAction = changeAryAction(
    EDIT_ARY__CHANGE_METADATA_ARY,
);
export const changeAryMethodologyForEditAryAction = changeAryAction(
    EDIT_ARY__CHANGE_METHODOLOGY_ARY,
);

// REDUCER

const setAry = (state, action) => {
    const {
        lead,

        serverId,
        versionId,
        metadata,
        methodology,
    } = action;
    const settings = {
        editAry: {
            [lead]: { $auto: {
                serverId: { $set: serverId },
                versionId: { $set: versionId },
                hasErrors: { $set: false },
                isPristine: { $set: true },
                formErrors: { $set: { } },
                fieldErrors: { $set: { } },
                formValues: { $set: {
                    metadata,
                    methodology,
                } },
            } },
        },
    };
    return update(state, settings);
};

const changeAry = groupName => (state, action) => {
    const {
        lead,

        // NOTE: these are individual
        formValues,
        formErrors,
        fieldErrors,
    } = action;

    // Calculate every groups error here
    const hasErrors = analyzeFieldErrors(formErrors) || analyzeFormErrors(fieldErrors);

    const settings = {
        editAry: {
            [lead]: { $auto: {
                hasErrors: { $set: hasErrors },
                isPristine: { $set: false },
                // TODO: add serverError later

                formValues: { $auto: {
                    [groupName]: { $set: formValues },
                } },
                fieldErrors: { $auto: {
                    [groupName]: { $set: fieldErrors },
                } },
                formErrors: { $auto: {
                    fields: { $auto: {
                        [groupName]: { $set: { fields: formErrors } },
                    } },
                } },
            } },
        },
    };
    return update(state, settings);
};

const setErrorAry = (state, action) => {
    const {
        lead,

        formErrors,
        fieldErrors,
    } = action;

    // Calculate every groups error here
    const hasErrors = analyzeFieldErrors(formErrors) || analyzeFormErrors(fieldErrors);

    const settings = {
        editAry: {
            [lead]: { $auto: {
                hasErrors: { $set: hasErrors },
                isPristine: { $set: false },
                formErrors: { $set: formErrors },
                fieldErrors: { $set: fieldErrors },
            } },
        },
    };
    return update(state, settings);
};

// FIXME: add new versionId and stuffs here
const saveAry = (state, action) => {
    const { lead } = action;

    const settings = {
        editAry: {
            [lead]: { $auto: {
                hasErrors: { $set: false },
                isPristine: { $set: true },
                fieldErrors: { $set: {} },
                formErrors: { $set: {} },
                /*
                formValues: { $set: formValues },
                */
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [EDIT_ARY__SET_ARY]: setAry,
    [EDIT_ARY__CHANGE_METADATA_ARY]: changeAry('metadata'),
    [EDIT_ARY__CHANGE_METHODOLOGY_ARY]: changeAry('methodology'),
    [EDIT_ARY__SAVE_ARY]: saveAry,
    [EDIT_ARY__SET_ERROR_ARY]: setErrorAry,
};

export default reducers;
