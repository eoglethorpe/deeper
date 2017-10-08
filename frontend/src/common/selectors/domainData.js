import { createSelector } from 'reselect'; // eslint-disable-line

// NOTE: Use these to make sure reference don't change
const emptyList = []; // eslint-disable-line
const emptyObject = {}; // eslint-disable-line

export const leadsSelector = ({ domainData }) => (domainData.leads || emptyList);
export const projectsSelector = ({ domainData }) => (domainData.projects || emptyList);
export const countriesSelector = ({ domainData }) => (domainData.countries || emptyList);
