import { wsEndpoint, GET, POST, PATCH, DELETE, commonHeaderForPost, p } from '../config/rest';

export const createUrlForProject = projectId => `${wsEndpoint}/projects/${projectId}/`;
export const createUrlForProjectOptions = projectId => `${wsEndpoint}/project-options/?project=${projectId}`;

export const createUrlForProjectsOfUser = userId => (
    `${wsEndpoint}/projects/?${p({ user: userId })}`
);

export const createUrlForUserGroupProjects = id => (
    `${wsEndpoint}/projects/?${p({ userGroup: id })}`
);

export const urlForProjects = `${wsEndpoint}/projects/?fields=id,title,version_id`;
export const urlForProjectCreate = `${wsEndpoint}/projects/`;

export const createParamsForProjects = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createParamsForProjectOptions = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createParamsForProjectPatch = ({ access }, data) => ({
    method: PATCH,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

export const createParamsForProjectCreate = ({ access }, { title, userGroups }) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        title,
        userGroups,
    }),
});

export const createParamsForProjectDelete = ({ access }) => ({
    method: DELETE,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
