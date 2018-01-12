import update from '../../../public/utils/immutable-update';

// TYPE

export const SET_USER_EXPORTS = 'domain-data/SET_USER_EXPORTS';

// ACTION-CREATOR

export const setUserExportsAction = ({ exports }) => ({
    type: SET_USER_EXPORTS,
    exports,
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

const reducers = {
    [SET_USER_EXPORTS]: setUserExports,
};

export default reducers;

