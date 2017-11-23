import { wsEndpoint, GET, POST, DELETE, PATCH, commonHeaderForPost, p } from '../config/rest';

export const urlForUserMembership = `${wsEndpoint}/group-memberships/`;

export const createUrlForUserGroup = userGroupId => `${wsEndpoint}/user-groups/${userGroupId}/`;

export const createUrlForUserMembership = userMembershipId =>
    `${wsEndpoint}/group-memberships/${userMembershipId}/`;

export const createUrlForUserGroupsOfUser = userId => (
    `${wsEndpoint}/user-groups/?${p({ user: userId })}`
);

export const urlForUserGroups = `${wsEndpoint}/user-groups/`;

export const createParamsForUserGroups = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createParamsForUserGroupsCreate = ({ access }, { title }) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        title,
    }),
});

export const createParamsForUserGroupsPatch = ({ access }, { title }) => ({
    method: PATCH,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        title,
    }),
});


export const createParamsForUserGroupsDelete = ({ access }) => ({
    method: DELETE,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createParamsForUserMembershipDelete = ({ access }) => ({
    method: DELETE,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createParamsForUserMembershipCreate = ({ access }, { memberList }) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        list: memberList,
    }),
});

export const createParamsForUserMembershipRoleChange = ({ access }, { newRole }) => ({
    method: PATCH,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        role: newRole,
    }),
});
