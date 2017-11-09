import { wsEndpoint, GET, POST, commonHeaderForPost, p } from '../config/rest';

export const createUrlForProject = projectId => `${wsEndpoint}/projects/${projectId}/`;

export const createUrlForProjectsOfUser = userId => (
    `${wsEndpoint}/projects/?${p({ user: userId })}`
);

export const urlForProjects = `${wsEndpoint}/projects/?fields=id,title`;

export const urlForProjectCreate = `${wsEndpoint}/projects/`;

export const createParamsForProjects = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createParamsForProjectCreate = ({ access }, { title }) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        title,
    }),
});
