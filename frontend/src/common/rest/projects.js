import { wsEndpoint, GET, commonHeaderForPost, p } from './index';

export const createUrlForProject = projectId => `${wsEndpoint}/projects/${projectId}/`;

export const createUrlForProjectsOfUser = userId => (
    `${wsEndpoint}/projects/?${p({ user: userId })}`
);

export const urlForProjects = `${wsEndpoint}/projects/?fields=id,title`;
export const createParamsForProjects = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
