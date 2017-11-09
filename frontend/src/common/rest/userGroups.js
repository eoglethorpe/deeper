import { wsEndpoint, GET, POST, DELETE, commonHeaderForPost, p } from '../config/rest';

export const createUrlForUserGroup = userGroupId => `${wsEndpoint}/user-groups/${userGroupId}/`;

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

export const createParamsForUserGroupsDelete = ({ access }) => ({
    method: DELETE,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
