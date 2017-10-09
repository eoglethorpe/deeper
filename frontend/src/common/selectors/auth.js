import { createSelector } from 'reselect'; // eslint-disable-line

// NOTE: Use these to make sure reference don't change
const emptyList = []; // eslint-disable-line
const emptyObject = {};

export const tokenSelector = ({ auth }) => (auth.token || emptyObject);
export const userSelector = ({ auth }) => (auth.user || emptyObject);
export const authenticatedSelector = ({ auth }) => auth.authenticated;
