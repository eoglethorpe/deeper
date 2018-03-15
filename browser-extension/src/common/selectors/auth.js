import jwtDecode from 'jwt-decode';
// import { createSelector } from 'reselect';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

export const tokenSelector = ({ auth }) => (
    auth.token || emptyObject
);

export const projectListSelector = ({ auth }) => (
    auth.projects || emptyList
);

export const leadOptionsSelector = ({ auth }) => (
    auth.leadOptions || emptyObject
);

export const currentUserIdSelector = ({ auth }) => {
    const token = auth.token || {};
    const decodedToken = jwtDecode(token.access);

    return decodedToken.userId;
};
