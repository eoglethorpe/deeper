import { wsEndpoint, GET, commonHeaderForPost, p } from './index';

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
