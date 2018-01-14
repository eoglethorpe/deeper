import update from '../../../public/utils/immutable-update';

// TYPE

export const SET_USER_EXPORTS = 'domain-data/SET_USER_EXPORTS';
export const SET_USER_EXPORT = 'domain-data/SET_USER_EXPORT';

// ACTION-CREATOR

export const setUserExportsAction = ({ exports }) => ({
    type: SET_USER_EXPORTS,
    exports,
});

export const setUserExportAction = ({ userExport }) => ({
    type: SET_USER_EXPORT,
    userExport,
});

// REDUCER

const setUserExports = (state, action) => {
    const { exports } = action;

    const exportsSettings = exports.reduce(
        (acc, e) => {
            acc[e.id] = { $auto: {
                $set: e,
            } };
            return acc;
        },
        {},
    );
    const settings = {
        userExports: exportsSettings,
    };
    return update(state, settings);
};

const setUserExport = (state, action) => {
    const { userExport } = action;

    const settings = {
        userExports: {
            [userExport.id]: { $auto: {
                $merge: userExport,
            } },
        },
    };

    return update(state, settings);
};

const reducers = {
    [SET_USER_EXPORTS]: setUserExports,
    [SET_USER_EXPORT]: setUserExport,
};

export default reducers;

