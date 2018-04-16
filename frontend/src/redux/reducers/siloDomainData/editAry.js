import {
    analyzeFieldErrors,
    analyzeFormErrors,
} from '../../../vendor/react-store/components/Input/Form/validator';
import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const EDIT_ARY__SET_ARY = 'siloDomainData/EDIT_ARY__SET_ARY';
export const EDIT_ARY__CHANGE_METHODOLOGY_ARY = 'siloDomainData/EDIT_ARY__CHANGE_METHODOLOGY_ARY';
export const EDIT_ARY__CHANGE_METADATA_ARY = 'siloDomainData/EDIT_ARY__CHANGE_METADATA_ARY';
export const EDIT_ARY__CHANGE_SUMMARY_ARY = 'siloDomainData/EDIT_ARY__CHANGE_SUMMARY_ARY';
export const EDIT_ARY__SAVE_ARY = 'siloDomainData/EDIT_ARY__SAVE_ARY';
export const EDIT_ARY__SET_ERROR_ARY = 'siloDomainData/EDIT_ARY__SET_ERROR_ARY';
export const EDIT_ARY__SET_ENTRIES = 'siloDomainData/EDIT_ARY__SET_ENTRIES';

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
    lead, serverId, versionId,
    metadata,
    methodology,
    summary,
}) => ({
    type: EDIT_ARY__SET_ARY,
    lead,
    serverId,
    versionId,
    metadata,
    methodology,
    summary,
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
export const changeArySummaryForEditAryAction = changeAryAction(
    EDIT_ARY__CHANGE_SUMMARY_ARY,
);

export const setEntriesForEditAryAction = ({ lead, entries }) => ({
    type: EDIT_ARY__SET_ENTRIES,
    lead,
    entries,
});

// REDUCER

const setAry = (state, action) => {
    const {
        lead,

        serverId,
        versionId,
        metadata,
        methodology,
        summary,
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
                    summary,
                } },
            } },
        },
    };
    return update(state, settings);
};

const changeAry = groupName => (state, action) => {
    const {
        lead,

        // NOTE: these are for individual groups
        // TODO: add serverError later

        formValues,
        formErrors,
        fieldErrors,
    } = action;

    const settings = {
        editAry: {
            [lead]: { $auto: {
                isPristine: { $set: false },
                formValues: { $auto: {
                    [groupName]: { $set: formValues },
                } },
                fieldErrors: { $auto: {
                    [groupName]: { $set: fieldErrors },
                } },
                formErrors: { $auto: {
                    fields: { $auto: {
                        [groupName]: { $set: formErrors },
                    } },
                } },
            } },
        },
    };
    const newState = update(state, settings);

    const hasErrors = analyzeFieldErrors(newState.editAry[lead].fieldErrors) ||
        analyzeFormErrors(newState.editAry[lead].formErrors);
    const errorSettings = {
        editAry: {
            [lead]: { $auto: {
                hasErrors: { $set: hasErrors },
            } },
        },
    };
    return update(newState, errorSettings);
};

const setErrorAry = (state, action) => {
    const {
        lead,

        formErrors,
        fieldErrors,
    } = action;

    const hasErrors = analyzeFieldErrors(fieldErrors) || analyzeFormErrors(formErrors);
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

const setEntries = (state, action) => {
    const { lead, entries } = action;
    const settings = {
        editAry: {
            [lead]: { $auto: {
                entries: { $set: entries },
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
    [EDIT_ARY__CHANGE_SUMMARY_ARY]: changeAry('summary'),
    [EDIT_ARY__SAVE_ARY]: saveAry,
    [EDIT_ARY__SET_ERROR_ARY]: setErrorAry,
    [EDIT_ARY__SET_ENTRIES]: setEntries,
};

export default reducers;
