import {
    analyzeErrors,
} from '../../../vendor/react-store/components/Input/Faram/validator';
import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const EDIT_ARY__SET_ARY = 'siloDomainData/EDIT_ARY__SET_ARY';
export const EDIT_ARY__SAVE_ARY = 'siloDomainData/EDIT_ARY__SAVE_ARY';
export const EDIT_ARY__CHANGE_ARY = 'siloDomainData/EDIT_ARY__CHANGE_ARY';
export const EDIT_ARY__SET_ERROR_ARY = 'siloDomainData/EDIT_ARY__SET_ERROR_ARY';
export const EDIT_ARY__SET_ENTRIES = 'siloDomainData/EDIT_ARY__SET_ENTRIES';

// ACTION-CREATOR

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

export const changeAryForEditAryAction = ({
    lead, faramValues, faramErrors,
}) => ({
    type: EDIT_ARY__CHANGE_ARY,
    lead,
    faramValues,
    faramErrors,
});

export const setErrorAryForEditAryAction = ({
    lead, faramErrors,
}) => ({
    type: EDIT_ARY__SET_ERROR_ARY,
    lead,
    faramErrors,
});


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
                faramErrors: { $set: { } },
                faramValues: { $set: {
                    metadata,
                    methodology,
                    summary,
                } },
            } },
        },
    };
    return update(state, settings);
};

const changeAry = (state, action) => {
    const {
        lead,
        faramValues,
        faramErrors,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);

    const settings = {
        editAry: {
            [lead]: { $auto: {
                isPristine: { $set: false },
                faramValues: { $set: faramValues },
                faramErrors: { $set: faramErrors },
                hasErrors: { $set: hasErrors },
            } },
        },
    };
    return update(state, settings);
};

const setErrorAry = (state, action) => {
    const {
        lead,
        faramErrors,
    } = action;

    const hasErrors = analyzeErrors(faramErrors);
    const settings = {
        editAry: {
            [lead]: { $auto: {
                hasErrors: { $set: hasErrors },
                isPristine: { $set: false },
                faramErrors: { $set: faramErrors },
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
                faramErrors: { $set: {} },
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
    [EDIT_ARY__SET_ENTRIES]: setEntries,

    [EDIT_ARY__CHANGE_ARY]: changeAry,
    [EDIT_ARY__SET_ERROR_ARY]: setErrorAry,
    [EDIT_ARY__SAVE_ARY]: saveAry,
};

export default reducers;
