import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SET_USER_EXPORTS = 'domainData/SET_USER_EXPORTS';
export const SET_USER_EXPORT = 'domainData/SET_USER_EXPORT';

// ACTION-CREATOR

export const setUserExportsAction = ({ exports, projectId }) => ({
    type: SET_USER_EXPORTS,
    exports,
    projectId,
});

export const setUserExportAction = ({ userExport }) => ({
    type: SET_USER_EXPORT,
    userExport,
});

// REDUCER

const setUserExports = (state, action) => {
    const { exports, projectId } = action;

    const exportsSettings = exports.reduce(
        (acc, e) => {
            acc[e.id] = { $set: e };
            return acc;
        },
        {},
    );
    const settings = {
        userExports: { $auto: {
            [projectId]: { $auto: exportsSettings },
        } },
    };
    return update(state, settings);
};

const setUserExport = (state, action) => {
    const { userExport } = action;

    const settings = {
        userExports: {
            [userExport.project]: { $auto: {
                [userExport.id]: { $auto: {
                    $merge: userExport,
                } },
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

