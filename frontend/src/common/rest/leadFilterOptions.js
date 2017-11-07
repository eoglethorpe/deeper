import { wsEndpoint } from './index';

// eslint-disable-next-line import/prefer-default-export
export const createUrlForLeadFilterOptions = projectId => (
    `${wsEndpoint}/lead-filter-options/?project=${projectId}`
);
