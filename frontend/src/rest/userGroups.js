import { wsEndpoint, POST, DELETE, PATCH, commonHeaderForPost, p } from '../config/rest';

export const urlForUserMembership = `${wsEndpoint}/group-memberships/`;

export const createUrlForUserGroup = userGroupId => `${wsEndpoint}/user-groups/${userGroupId}/`;

export const createUrlForUserMembership = userMembershipId =>
    `${wsEndpoint}/group-memberships/${userMembershipId}/`;

export const createUrlForUserGroupsOfUser = userId => (
    `${wsEndpoint}/user-groups/?${p({ user: userId })}`
);

export const urlForUserGroups = `${wsEndpoint}/user-groups/`;

export const createParamsForUserGroupsCreate = ({ title }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        title,
    }),
});

export const createParamsForUserGroupsPatch = ({ title, description }) => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        title,
        description,
    }),
});

export const createParamsForUserGroupsDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForUserMembershipDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForUserMembershipCreate = ({ memberList }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        list: memberList,
    }),
});

export const createParamsForUserMembershipRoleChange = ({ newRole }) => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        role: newRole,
    }),
});
