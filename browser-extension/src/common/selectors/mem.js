import { createSelector } from 'reselect'; // eslint-disable-line no-unused-vars

// NOTE: Use these to make sure reference don't change
const emptyList = []; // eslint-disable-line no-unused-vars
const emptyObject = {}; // eslint-disable-line no-unused-vars

// eslint-disable-next-line import/prefer-default-export
export const currentTabIdSelector = ({ mem }) => (
    mem.currentTabId
);
