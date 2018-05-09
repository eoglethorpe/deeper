import update from '../../../vendor/react-store/utils/immutable-update';

// TYPE

export const SET_USER_GROUPS = 'domainData/SET_USER_GROUPS';
export const SET_USER_GROUP = 'domainData/SET_USER_GROUP';
export const UNSET_USER_GROUP = 'domainData/UNSET_USER_GROUP';
export const SET_USERS_MEMBERSHIP = 'domainData/SET_USERS_MEMBERSHIP';
export const SET_USER_MEMBERSHIP = 'domainData/SET_USER_MEMBERSHIP';
export const UNSET_USER_MEMBERSHIP = 'domainData/UNSET_USER_MEMBERSHIP';

// ACTION-CREATOR

export const setUserGroupsAction = ({ userId, userGroups }) => ({
    type: SET_USER_GROUPS,
    userId,
    userGroups,
});

export const setUserGroupAction = ({ userId, userGroup }) => ({
    type: SET_USER_GROUP,
    userId,
    userGroup,
});

export const unSetUserGroupAction = ({ userId, userGroupId }) => ({
    type: UNSET_USER_GROUP,
    userId,
    userGroupId,
});

export const setUsersMembershipAction = ({ usersMembership, userGroupId }) => ({
    type: SET_USERS_MEMBERSHIP,
    usersMembership,
    userGroupId,
});

export const setUserMembershipAction = ({ userMembership, userGroupId }) => ({
    type: SET_USER_MEMBERSHIP,
    userMembership,
    userGroupId,
});

export const unSetMembershipAction = ({ membershipId, userGroupId }) => ({
    type: UNSET_USER_MEMBERSHIP,
    membershipId,
    userGroupId,
});

// REDUCER

const setUserGroups = (state, action) => {
    const { userGroups, userId } = action;

    const userGroupSettings = userGroups.reduce(
        (acc, userGroup) => {
            acc[userGroup.id] = { $auto: {
                $merge: userGroup,
            } };
            return acc;
        },
        {},
    );

    const settings = {
        userGroups: userGroupSettings,
    };

    if (userId) {
        settings.users = {
            [userId]: { $auto: {
                userGroups: { $autoArray: {
                    $set: userGroups.map(userGroup => (
                        userGroup.id
                    )),
                } },
            } },
        };
    }
    return update(state, settings);
};

const setUserGroup = (state, action) => {
    const { userGroup, userId } = action;
    const settings = {
        userGroups: {
            [userGroup.id]: { $auto: {
                $merge: userGroup,
            } },
        },
    };

    if (userId) {
        const userGroupArrayIndex = ((state.users[userId] || {}).userGroups
            || []).indexOf(userGroup.id);

        if (userGroupArrayIndex === -1) {
            settings.users = {
                [userId]: { $auto: {
                    userGroups: { $autoArray: {
                        $push: [userGroup.id],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const unsetUserGroup = (state, action) => {
    const { userGroupId, userId } = action;
    const settings = {
        userGroups: {
            [userGroupId]: { $auto: {
                $set: undefined,
            } },
        },
    };

    if (userId) {
        const userGroupArrayIndex = ((state.users[userId] || {}).userGroups
            || []).indexOf(userGroupId);

        if (userGroupArrayIndex !== -1) {
            settings.users = {
                [userId]: { $auto: {
                    userGroups: { $autoArray: {
                        $splice: [[userGroupArrayIndex, 1]],
                    } },
                } },
            };
        }
    }
    return update(state, settings);
};

const setUsersMembership = (state, action) => {
    const { userGroupId, usersMembership } = action;

    const memberships = ((state.userGroups[userGroupId] || {}).memberships || []);
    const newUsersMemberShip = usersMembership.filter(
        userMembership => (
            memberships.findIndex(member => (member.id === userMembership.id)) === -1
        ),
    );

    const settings = {
        userGroups: {
            [userGroupId]: { $auto: {
                memberships: { $autoArray: {
                    $push: newUsersMemberShip,
                } },
            } },
        },
    };
    return update(state, settings);
};

const setUserMembership = (state, action) => {
    const { userGroupId, userMembership } = action;

    const memberships = ((state.userGroups[userGroupId] || {}).memberships || []);
    const updatedUsersMemberShipIndex = memberships.findIndex(
        membership => (userMembership.id === membership.id),
    );

    const settings = {
        userGroups: {
            [userGroupId]: { $auto: {
                memberships: { $autoArray: {
                    [updatedUsersMemberShipIndex]: { $auto: {
                        $merge: userMembership,
                    } },
                } },
            } },
        },
    };
    return update(state, settings);
};

const unsetUserMembership = (state, action) => {
    const { userGroupId, membershipId } = action;

    const memberships = ((state.userGroups[userGroupId] || {}).memberships || []);
    const groupMembershipArrayIndex = memberships.findIndex(
        membership => (membership.id === membershipId),
    );

    if (groupMembershipArrayIndex !== -1) {
        const settings = {
            userGroups: {
                [userGroupId]: { $auto: {
                    memberships: { $autoArray: {
                        $splice: [[groupMembershipArrayIndex, 1]],
                    } },
                } },
            },
        };
        return update(state, settings);
    }
    return state;
};

const reducers = {
    [SET_USER_GROUP]: setUserGroup,
    [SET_USER_GROUPS]: setUserGroups,
    [UNSET_USER_GROUP]: unsetUserGroup,
    [SET_USERS_MEMBERSHIP]: setUsersMembership,
    [SET_USER_MEMBERSHIP]: setUserMembership,
    [UNSET_USER_MEMBERSHIP]: unsetUserMembership,
};
export default reducers;
