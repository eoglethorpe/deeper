import { createSelector } from 'reselect'; // eslint-disable-line

// NOTE: Use these to make sure reference don't change
const emptyList = []; // eslint-disable-line
const emptyObject = {}; // eslint-disable-line

export const blockUISelector = ({ navbar }) => navbar.blockUI;
export const navbarVisibleSelector = ({ navbar }) => navbar.visible;
export const navbarActiveLinkSelector = ({ navbar }) => navbar.activeLink;
export const navbarValidLinksSelector = ({ navbar }) => navbar.validLinks || emptyList;
