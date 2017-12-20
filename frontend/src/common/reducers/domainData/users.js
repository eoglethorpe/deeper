import update from '../../../public/utils/immutable-update';

// TYPE

export const SET_USER_INFORMATION = 'domain-data/SET_USER_INFORMATION';
export const UNSET_USER = 'domain-data/UNSET_USER';
export const SET_USERS_INFORMATION = 'domain-data/SET_USERS_INFORMATION';

// ACTION-CREATOR

export const setUserInformationAction = ({ userId, information }) => ({
    type: SET_USER_INFORMATION,
    userId,
    information,
});

export const unsetUserAction = ({ userId }) => ({
    type: UNSET_USER,
    userId,
});

export const setUsersInformationAction = ({ users }) => ({
    type: SET_USERS_INFORMATION,
    users,
});

// REDUCER

const setUserInformation = (state, action) => {
    const { userId, information } = action;
    const settings = {
        users: {
            [userId]: { $auto: {
                information: { $auto: {
                    $merge: information,
                } },
            } },
        },
    };
    return update(state, settings);
};

const unsetUserInformation = (state, action) => {
    const settings = {
        users: {
            [action.userId]: { $set: undefined },
        },
    };
    return update(state, settings);
};

const setUsersInformation = (state, action) => {
    const { users } = action;

    const userSettings = users.reduce(
        (acc, user) => {
            acc[user.id] = { $auto: {
                information: { $auto: {
                    $merge: user,
                } },
            } };
            return acc;
        },
        {},
    );
    const settings = {
        users: userSettings,
    };
    return update(state, settings);
};


const reducers = {
    [SET_USER_INFORMATION]: setUserInformation,
    [UNSET_USER]: unsetUserInformation,
    [SET_USERS_INFORMATION]: setUsersInformation,
};
export default reducers;
