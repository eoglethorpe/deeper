import { wsEndpoint } from '../config/rest';

// eslint-disable-next-line import/prefer-default-export
export const createUrlForLeadFilterOptions = projectId => (
    `${wsEndpoint}/lead-filter-options/?project=${projectId}`
);
