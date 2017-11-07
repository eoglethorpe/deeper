import { RestRequest } from '../public/utils/rest';

// Aliash for prepareQueryParams
const p = RestRequest.prepareUrlParams;

let wsEndpoint;

if (process.env.REACT_APP_API_END) {
    let reactAppApiHttps;

    if (location.protocol === 'https:') {
        reactAppApiHttps = 'https';
    } else {
        reactAppApiHttps = process.env.REACT_APP_API_HTTPS;
    }

    wsEndpoint = `${reactAppApiHttps}://${process.env.REACT_APP_API_END}/api/v1`;
} else {
    wsEndpoint = '/api/v1';
}
const POST = 'POST';
const GET = 'GET'; // eslint-disable-line
const PUT = 'PUT'; // eslint-disable-line
const DELETE = 'DELETE'; // eslint-disable-line
const PATCH = 'PATCH'; // eslint-disable-line

const commonHeaderForPost = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const urlForUpload = `${wsEndpoint}/files/`;
export const createHeaderForFileUpload = ({ access }) => ({
    Authorization: `Bearer ${access}`,
});

export const urlForUserCreate = `${wsEndpoint}/users/`;
export const urlForTokenCreate = `${wsEndpoint}/token/`;
export const urlForTokenCreateHid = `${wsEndpoint}/token/hid/`;
export const urlForTokenRefresh = `${wsEndpoint}/token/refresh/`;
export const urlForProjects = `${wsEndpoint}/projects/?fields=id,title`;
export const urlForUserGroups = `${wsEndpoint}/user-groups/`;
export const urlForApiDocs = `${wsEndpoint}/docs/`;
export const urlForCountries = `${wsEndpoint}/regions/`;

export const urlForLeadCreate = `${wsEndpoint}/leads/`;

export const createUrlForProjectsOfUser = userId => (
    `${wsEndpoint}/projects/?${p({ user: userId })}`
);
export const createUrlForUserGroupsOfUser = userId => (
    `${wsEndpoint}/user-groups/?${p({ user: userId })}`
);
export const createUrlForProject = projectId => `${wsEndpoint}/projects/${projectId}/`;
export const createUrlForLeadsOfProject = params => (
    `${wsEndpoint}/leads/?${p(params)}`
);
export const createUrlForUser = userId => `${wsEndpoint}/users/${userId}/`;
export const createUrlForUserPatch = userId => `${wsEndpoint}/users/${userId}/`;

export const createUrlForLeadFilterOptions = projectId => `${wsEndpoint}/lead-filter-options/?project=${projectId}`;

export const createParamsForLeadCreate = ({ access }, data) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify(data),
});

// ----------------------------------------------------------------------------- 
// PROJECTS RELATED
// ----------------------------------------------------------------------------- 
export const createParamsForProjects = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
export const createParamsForUserGroups = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});
// ----------------------------------------------------------------------------- 


// ----------------------------------------------------------------------------- 
// USER RELATED
// ----------------------------------------------------------------------------- 
export const createParamsForUser = ({ access }) => ({
    method: GET,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
});

export const createParamsForUserCreate = ({
    firstName, lastName, organization, country, email, password,
}) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        firstName,
        lastName,
        organization,
        country,
        email,
        password,
        username: email,
        displayPicture: null,
    }),
});

export const createParamsForUserPatch = ({ access }, {
    firstName,
    lastName,
    organization,
}) => ({
    method: PATCH,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        firstName,
        lastName,
        organization,
    }),
});
// ----------------------------------------------------------------------------- 


// ----------------------------------------------------------------------------- 
// TOKEN RELATED
// ----------------------------------------------------------------------------- 
export const createParamsForTokenCreate = ({ username, password }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        username,
        password,
    }),
});

export const createParamsForTokenRefresh = ({ refresh, access }) => ({
    method: POST,
    headers: {
        Authorization: `Bearer ${access}`,
        ...commonHeaderForPost,
    },
    body: JSON.stringify({
        refresh,
    }),
});

export const createParamsForTokenCreateHid = ({ access_token, expires_in, state, token_type }) => ({
    method: POST,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        accessToken: access_token,
        expiresIn: expires_in,
        state,
        tokenType: token_type,
    }),
});
// ----------------------------------------------------------------------------- 
