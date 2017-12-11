import { wsEndpoint, GET, POST, PATCH, DELETE, commonHeaderForPost, p } from '../config/rest';

export const createUrlForProject = projectId => `${wsEndpoint}/projects/${projectId}/`;
export const createUrlForProjectOptions = projectId => `${wsEndpoint}/project-options/?project=${projectId}`;

export const createUrlForProjectsOfUser = userId => (
    `${wsEndpoint}/projects/?${p({ user: userId })}`
);

export const createUrlForUserGroupProjects = id => (
    `${wsEndpoint}/projects/?${p({ userGroup: id })}`
);

export const urlForProjects = `${wsEndpoint}/projects/?fields=id,title,version_id,role`;
export const urlForProjectCreate = `${wsEndpoint}/projects/`;
export const urlForProjectMembership = `${wsEndpoint}/project-memberships/`;
export const createUrlForUserProjectMembership = membershipId =>
    `${wsEndpoint}/project-memberships/${membershipId}/`;

export const createParamsForProjects = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

export const createParamsForProjectOptions = () => ({
    method: GET,
    headers: commonHeaderForPost,
});

export const createParamsForProjectPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForUserProjectMembershipPatch = data => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(data),
});

export const createParamsForProjectCreate = ({ title, userGroups }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        title,
        userGroups,
    }),
});

export const createParamsForProjectMembershipCreate = ({ memberList }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        list: memberList,
    }),
});

export const createParamsForProjectDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

export const createParamsForUserProjectMembershipDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});
