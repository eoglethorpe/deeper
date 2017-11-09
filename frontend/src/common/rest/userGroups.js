import { wsEndpoint, GET, POST, commonHeaderForPost, p } from '../config/rest';

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
