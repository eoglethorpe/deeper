// import { createSelector } from 'reselect';

// NOTE: Use these to make sure reference don't change
const emptyList = [];
const emptyObject = {};

export const tokenSelector = (state) => {
    console.log('selector', state);
    return state.auth.token || emptyObject;
};

export const projectListSelector = ({ auth }) => (
    auth.projects || emptyList
);

export const leadOptionsSelector = ({ auth }) => (
    auth.leadOptions || emptyObject
);
