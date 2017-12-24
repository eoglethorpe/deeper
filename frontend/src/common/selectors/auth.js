import { createSelector } from 'reselect'; // eslint-disable-line no-unused-vars

// NOTE: Use these to make sure reference don't change
const emptyList = []; // eslint-disable-line
const emptyObject = {};

export const tokenSelector = ({ auth }) => (auth.token || emptyObject);
export const activeUserSelector = ({ auth }) => (auth.activeUser || emptyObject);
export const authenticatedSelector = ({ auth }) => auth.authenticated;
